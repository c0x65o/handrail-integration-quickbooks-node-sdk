import {
  listRequest,
  optionalFlag,
  optionalNumberFlag,
  withoutUndefined
} from "./shared.js";
import { withFutureErpConfigArtifact } from "../future-erp-config.js";
import { HandrailQuickBooksError } from "../../errors.js";
import type {
  HandrailQuickBooksConnectionStatusResponse,
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
  description: "Print a redacted operator smoke summary for connection, import, checkpoint, and synced objects.",
  name: "smoke",
  run: runSmokeCommand,
  usage:
    "handrail-qbo smoke --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123"
};

async function runSmokeCommand(context: CliCommandContext) {
  const futureErpConfigOutput = withFutureErpConfigArtifact({}, context);
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
    items,
    classes,
    locations,
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
    probe(() => context.client.items.list(commonListRequest)),
    probe(() => context.client.classes.list(commonListRequest)),
    probe(() => context.client.locations.list(commonListRequest)),
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
      items: summarizeProbe(items, summarizeListCount),
      classes: summarizeProbe(classes, summarizeListCount),
      locations: summarizeProbe(locations, summarizeListCount),
      parties: summarizeProbe(parties, summarizeListCount),
      transactions: summarizeProbe(transactions, summarizeListCount),
      ledgerEntries: summarizeProbe(ledgerEntries, summarizeListCount)
    },
    checkpoint: checkpointValue ? summarizeCheckpoint(checkpointValue, context.config.tenantId) : undefined,
    futureErpConfig: futureErpConfigOutput.futureErpConfig,
    ...("localOverrideDiagnostics" in futureErpConfigOutput
      ? { localOverrideDiagnostics: futureErpConfigOutput.localOverrideDiagnostics }
      : {})
  };
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
    providerMode: value.providerMode,
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
