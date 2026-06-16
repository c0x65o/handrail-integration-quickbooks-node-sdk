import {
  listRequest,
  optionalBooleanFlag,
  optionalFlag,
  optionalNumberFlag,
  withoutUndefined
} from "./shared.js";
import { HandrailQuickBooksConfigError, HandrailQuickBooksError } from "../../errors.js";
import type {
  HandrailQuickBooksAccountingBasis,
  HandrailQuickBooksAgingReportRequest,
  HandrailQuickBooksAsOfReportRequest,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksFinancialStatementRequest,
  HandrailQuickBooksGeneralLedgerRequest,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksImportVolumeSummary,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksRawImportStatus,
  HandrailQuickBooksSyncCheckpoint,
  HandrailQuickBooksSyncCheckpointMetadata,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTokenStatusResponse
} from "../../types.js";
import type { CliCommandDefinition, CliCommandContext } from "../types.js";

type ProbeResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SafeProbeError };

interface SafeProbeError {
  readonly code?: string;
  readonly requestId?: string;
  readonly retryable?: boolean;
  readonly status?: number;
}

type CheckpointLike = HandrailQuickBooksSyncCheckpoint | HandrailQuickBooksSyncCheckpointMetadata;

const DEFAULT_SMOKE_LIMIT = 25;

export const smokeCommand: CliCommandDefinition = {
  description: "Print a redacted operator smoke summary for connection, import, checkpoint, normalized data, and reports.",
  name: "smoke",
  run: runSmokeCommand,
  usage:
    "handrail-qbo smoke --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123 --as-of 2026-05-31 --period-start 2026-05-01 --period-end 2026-05-31"
};

async function runSmokeCommand(context: CliCommandContext) {
  const limit = optionalNumberFlag(context.flags, "limit") ?? DEFAULT_SMOKE_LIMIT;
  const importBatchId = optionalFlag(context.flags, "import-batch-id");
  const syncJobId = optionalFlag(context.flags, "sync-job-id");
  const checkpointId = optionalFlag(context.flags, "checkpoint-id");
  const commonListRequest = withoutUndefined({
    ...listRequest(context.flags),
    limit
  });

  const [
    connection,
    tokenCustody,
    rawImport,
    importBatch,
    syncJob,
    checkpoint,
    accounts,
    parties,
    transactions,
    ledgerEntries
  ] = await Promise.all([
    probe(() => context.client.connections.status()),
    probe(() => context.client.connections.tokenStatus()),
    importBatchId
      ? probe(() => context.client.rawImports.status(importBatchId))
      : probeListFirst(() => context.client.rawImports.list(commonListRequest)),
    importBatchId
      ? probe(() => context.client.importBatches.get(importBatchId))
      : probeListFirst(() => context.client.importBatches.list(commonListRequest)),
    syncJobId
      ? probe(() => context.client.syncJobs.get(syncJobId))
      : probeListFirst(() => context.client.syncJobs.list(commonListRequest)),
    checkpointId
      ? probe(() => context.client.checkpoints.get(checkpointId))
      : probeListFirst(() => context.client.checkpoints.list(commonListRequest)),
    probe(() => context.client.accounts.list(commonListRequest)),
    probe(() => context.client.parties.list(commonListRequest)),
    probe(() => context.client.transactions.list(commonListRequest)),
    probe(() => context.client.ledgerEntries.list(commonListRequest))
  ]);

  const rawImportValue = valueOrUndefined(rawImport);
  const importBatchValue = valueOrUndefined(importBatch);
  const syncJobValue = valueOrUndefined(syncJob);
  const checkpointValue =
    valueOrUndefined(checkpoint) ??
    syncJobValue?.checkpoint ??
    rawImportValue?.checkpoint;

  return {
    generatedAt: new Date().toISOString(),
    tenantId: context.config.tenantId,
    connection: summarizeProbe(connection, summarizeConnection),
    tokenCustody: summarizeProbe(tokenCustody, summarizeTokenCustody),
    rawImport: summarizeProbe(rawImport, summarizeRawImport),
    importBatch: summarizeProbe(importBatch, summarizeImportBatch),
    syncJob: summarizeProbe(syncJob, summarizeSyncJob),
    importVolume: summarizeImportVolume(
      rawImportValue?.importVolume ??
        syncJobValue?.importVolume ??
        volumeFromImportBatch(importBatchValue)
    ),
    normalizedCounts: {
      accounts: summarizeProbe(accounts, summarizeListCount),
      parties: summarizeProbe(parties, summarizeListCount),
      transactions: summarizeProbe(transactions, summarizeListCount),
      ledgerEntries: summarizeProbe(ledgerEntries, summarizeListCount)
    },
    checkpoint: checkpointValue ? summarizeCheckpoint(checkpointValue, context.config.tenantId) : undefined,
    reports: shouldProbeReports(context.flags)
      ? await summarizeReportAvailability(context)
      : { skipped: true }
  };
}

async function summarizeReportAvailability(context: CliCommandContext) {
  const requests = reportRequests(context.flags);

  const [
    trialBalance,
    profitAndLoss,
    balanceSheet,
    cashFlow,
    generalLedger,
    accountsReceivableAging,
    accountsPayableAging
  ] = await Promise.all([
    probe(() => context.client.reports.trialBalance(requests.trialBalance)),
    probe(() => context.client.reports.profitAndLoss(requests.financialStatement)),
    probe(() => context.client.reports.balanceSheet(requests.asOf)),
    probe(() => context.client.reports.cashFlow(requests.financialStatement)),
    probe(() => context.client.reports.generalLedger(requests.generalLedger)),
    probe(() => context.client.reports.accountsReceivableAging(requests.aging)),
    probe(() => context.client.reports.accountsPayableAging(requests.aging))
  ]);

  return {
    trialBalance: summarizeProbe(trialBalance, summarizeReport),
    profitAndLoss: summarizeProbe(profitAndLoss, summarizeReport),
    balanceSheet: summarizeProbe(balanceSheet, summarizeReport),
    cashFlow: summarizeProbe(cashFlow, summarizeReport),
    generalLedger: summarizeProbe(generalLedger, summarizeReport),
    accountsReceivableAging: summarizeProbe(accountsReceivableAging, summarizeReport),
    accountsPayableAging: summarizeProbe(accountsPayableAging, summarizeReport)
  };
}

function reportRequests(flags: ReadonlyMap<string, string | true>) {
  const asOfDate = optionalFlag(flags, "as-of-date") ?? optionalFlag(flags, "as-of") ?? currentDate();
  const period = {
    endDate: optionalFlag(flags, "period-end") ?? optionalFlag(flags, "end-date") ?? asOfDate,
    startDate: optionalFlag(flags, "period-start") ?? optionalFlag(flags, "start-date") ?? asOfDate
  };
  const accountingBasis = optionalBasis(flags);
  const currencyCode = optionalFlag(flags, "currency");
  const financialStatement = withoutUndefined({
    accountingBasis,
    currencyCode,
    period
  }) satisfies HandrailQuickBooksFinancialStatementRequest;
  const asOf = withoutUndefined({
    accountingBasis,
    asOfDate,
    currencyCode
  }) satisfies HandrailQuickBooksAsOfReportRequest;
  const aging = withoutUndefined({
    ...asOf,
    bucketDays: bucketDays(flags)
  }) satisfies HandrailQuickBooksAgingReportRequest;
  const generalLedger = withoutUndefined({
    ...financialStatement,
    accountId: optionalFlag(flags, "account-id"),
    partyId: optionalFlag(flags, "party-id"),
    transactionId: optionalFlag(flags, "transaction-id")
  }) satisfies HandrailQuickBooksGeneralLedgerRequest;

  return {
    aging,
    asOf,
    financialStatement,
    generalLedger,
    trialBalance: asOf
  };
}

function shouldProbeReports(flags: ReadonlyMap<string, string | true>) {
  const skipReportProbes = optionalBooleanFlag(flags, "skip-report-probes");
  if (skipReportProbes === true) {
    return false;
  }

  const reportProbes = optionalBooleanFlag(flags, "report-probes");
  return reportProbes !== false;
}

function optionalBasis(flags: ReadonlyMap<string, string | true>): HandrailQuickBooksAccountingBasis | undefined {
  const value = optionalFlag(flags, "basis") ?? optionalFlag(flags, "accounting-basis");
  if (value === undefined) {
    return undefined;
  }

  if (value !== "accrual" && value !== "cash") {
    throw new HandrailQuickBooksConfigError("--basis must be accrual or cash.");
  }

  return value;
}

function bucketDays(flags: ReadonlyMap<string, string | true>) {
  const raw = optionalFlag(flags, "bucket-days");
  if (!raw) {
    return undefined;
  }

  const parsed = raw.split(",").map((value) => Number(value.trim()));
  if (parsed.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new HandrailQuickBooksConfigError("--bucket-days must be a comma-separated list of positive numbers.");
  }

  return parsed;
}

async function probe<T>(operation: () => Promise<T>): Promise<ProbeResult<T>> {
  try {
    return {
      ok: true,
      value: await operation()
    };
  } catch (error) {
    return {
      error: safeProbeError(error),
      ok: false
    };
  }
}

async function probeListFirst<T>(
  operation: () => Promise<HandrailQuickBooksListResponse<T>>
): Promise<ProbeResult<T | undefined>> {
  const response = await probe(operation);
  if (!response.ok) {
    return response;
  }

  return {
    ok: true,
    value: response.value.data[0]
  };
}

function safeProbeError(error: unknown): SafeProbeError {
  if (error instanceof HandrailQuickBooksError) {
    return withoutUndefined({
      code: error.code,
      requestId: error.requestId,
      retryable: error.retryable || undefined,
      status: error.status
    });
  }

  return {};
}

function summarizeProbe<T, TSummary>(
  result: ProbeResult<T | undefined>,
  summarize: (value: T) => TSummary
) {
  if (!result.ok) {
    return {
      available: false,
      error: result.error
    };
  }

  if (result.value === undefined) {
    return {
      available: false,
      reason: "not_found"
    };
  }

  return {
    available: true,
    ...summarize(result.value)
  };
}

function valueOrUndefined<T>(result: ProbeResult<T>) {
  return result.ok ? result.value : undefined;
}

function summarizeConnection(value: HandrailQuickBooksConnectionStatusResponse) {
  return withoutUndefined({
    connectionId: value.connection?.connectionId,
    connectedAt: value.connection?.connectedAt,
    lastSyncedAt: value.connection?.lastSyncedAt,
    providerEnvironment: value.providerEnvironment,
    providerProfile: value.providerProfile
      ? withoutUndefined({
        environment: value.providerProfile.environment,
        name: value.providerProfile.name,
        status: value.providerProfile.status
      })
      : undefined,
    status: value.status,
    tenantId: value.tenantId
  });
}

function summarizeTokenCustody(value: HandrailQuickBooksTokenStatusResponse) {
  return withoutUndefined({
    connectionId: value.connectionId,
    expiresAt: value.expiresAt,
    reauthorizationRequired: value.reauthorizationRequired,
    status: value.status,
    tenantId: value.tenantId
  });
}

function summarizeRawImport(value: HandrailQuickBooksRawImportStatus) {
  return withoutUndefined({
    completedAt: value.completedAt,
    entity: value.entity,
    errorCount: value.errorCount,
    importBatchId: value.importBatchId,
    objectCount: value.objectCount,
    objectType: value.objectType,
    startedAt: value.startedAt,
    status: value.status,
    syncMode: value.syncMode,
    syncPhase: value.syncPhase,
    warningCount: value.warningCount
  });
}

function summarizeImportBatch(value: HandrailQuickBooksImportBatchSummary) {
  return withoutUndefined({
    completedAt: value.completedAt,
    errorCount: value.errorCount,
    importBatchId: value.importBatchId,
    jobCount: value.jobIds.length,
    startedAt: value.startedAt,
    status: value.status,
    syncJobRefCount: value.syncJobRefs.length,
    totalObjectCount: value.totalObjectCount,
    warningCount: value.warningCount
  });
}

function summarizeSyncJob(value: HandrailQuickBooksSyncJobSummary) {
  return withoutUndefined({
    completedAt: value.completedAt,
    entity: value.entity,
    importBatchId: value.importBatchId,
    jobId: value.jobId,
    objectCount: value.objectCount,
    objectType: value.objectType,
    startedAt: value.startedAt,
    status: value.status,
    syncMode: value.syncMode,
    syncPhase: value.syncPhase
  });
}

function summarizeImportVolume(value: HandrailQuickBooksImportVolumeSummary | undefined) {
  if (!value) {
    return undefined;
  }

  return {
    entityCounts: value.entityCounts,
    errorCount: value.errorCount,
    objectCount: value.objectCount,
    objectCounts: value.objectCounts,
    totalObjectCount: value.totalObjectCount,
    warningCount: value.warningCount
  };
}

function volumeFromImportBatch(
  value: HandrailQuickBooksImportBatchSummary | undefined
): HandrailQuickBooksImportVolumeSummary | undefined {
  if (!value) {
    return undefined;
  }

  return {
    entityCounts: value.entityCounts,
    errorCount: value.errorCount,
    objectCount: value.totalObjectCount,
    objectCounts: value.objectCounts,
    totalObjectCount: value.totalObjectCount,
    warningCount: value.warningCount
  };
}

function summarizeCheckpoint(value: CheckpointLike, tenantId: string | undefined) {
  const checkpointRef =
    "checkpointRef" in value
      ? value.checkpointRef
      : tenantId
        ? `checkpoint://quickbooks/${tenantId}/${value.checkpointId}`
        : undefined;

  return withoutUndefined({
    checkpointId: value.checkpointId,
    checkpointKind: value.checkpointKind,
    checkpointRef,
    completedAt: value.completedAt,
    cursorRefCount: value.cursorRefs.length,
    cursorRefs: value.cursorRefs,
    entity: value.entity,
    importBatchId: value.importBatchId,
    jobIds: value.jobIds,
    objectType: value.objectType,
    providerUpdatedAtWatermark: value.providerUpdatedAtWatermark,
    startedAt: value.startedAt,
    status: value.status,
    syncJobRefCount: value.syncJobRefs.length,
    syncMode: value.syncMode
  });
}

function summarizeListCount<T>(value: HandrailQuickBooksListResponse<T>) {
  return withoutUndefined({
    count: value.data.length,
    cursor: value.page?.cursor,
    hasMore: value.page?.hasMore,
    limit: value.page?.limit
  });
}

function summarizeReport(value: unknown) {
  const report = objectRecord(value) ?? {};
  const lines = arrayLength(report.lines);
  const rows = arrayLength(report.rows);
  const totals = objectRecord(report.totals);

  return withoutUndefined({
    asOfDate: stringValue(report.asOfDate),
    generatedAt: stringValue(report.generatedAt),
    lineCount: lines,
    name: stringValue(report.name),
    period: objectRecord(report.period),
    rowCount: rows,
    totalNames: totals ? Object.keys(totals).sort() : undefined
  });
}

function objectRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}
