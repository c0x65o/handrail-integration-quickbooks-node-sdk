import {
  parseFutureErpQuickBooksTenantMapJson,
  resolveFutureErpQuickBooksTenantId,
  type HandrailQuickBooksFutureErpTenantContext,
  type HandrailQuickBooksFutureErpTenantMap,
  type HandrailQuickBooksFutureErpTenantMapContractId,
  type HandrailQuickBooksFutureErpTenantMapping,
  type HandrailQuickBooksFutureErpTenantMappingStatus,
  type HandrailQuickBooksFutureErpTenantMapResolveOptions,
  HandrailQuickBooksAccount,
  HandrailQuickBooksAccountListResponse,
  HandrailQuickBooksAccountsPayableAgingReport,
  HandrailQuickBooksAccountsReceivableAgingReport,
  HandrailQuickBooksAgingReportRequest,
  HandrailQuickBooksAuditReference,
  HandrailQuickBooksBalanceSheetReport,
  HandrailQuickBooksBalanceSheetRequest,
  HandrailQuickBooksCashFlowReport,
  HandrailQuickBooksCashFlowRequest,
  HandrailQuickBooksClass,
  HandrailQuickBooksClassListResponse,
  HandrailQuickBooksConnectionStatus,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksDeltaSyncCounts,
  HandrailQuickBooksDrilldownRequest,
  HandrailQuickBooksDrilldownResult,
  HandrailQuickBooksGeneralLedgerReport,
  HandrailQuickBooksGeneralLedgerRequest,
  HandrailQuickBooksImportBatchListResponse,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksItem,
  HandrailQuickBooksItemListResponse,
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksLedgerEntryListResponse,
  HandrailQuickBooksLedgerSearchRequest,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksLocation,
  HandrailQuickBooksLocationListResponse,
  HandrailQuickBooksNormalizedResource,
  HandrailQuickBooksPageInfo,
  HandrailQuickBooksParty,
  HandrailQuickBooksPartyListResponse,
  HandrailQuickBooksProfitAndLossReport,
  HandrailQuickBooksProfitAndLossRequest,
  HandrailQuickBooksProviderEnvironment,
  HandrailQuickBooksProviderMode,
  HandrailQuickBooksRawImportStatus,
  HandrailQuickBooksRawImportStatusListResponse,
  HandrailQuickBooksReportDrilldownReference,
  HandrailQuickBooksReportLine,
  HandrailQuickBooksReportName,
  HandrailQuickBooksReportRequest,
  HandrailQuickBooksReportResponse,
  HandrailQuickBooksReportSnapshotMetadata,
  HandrailQuickBooksReportTotal,
  HandrailQuickBooksReportedProviderMode,
  HandrailQuickBooksRequestOptions,
  HandrailQuickBooksRetryState,
  HandrailQuickBooksSdkConfigInput,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncCheckpoint,
  HandrailQuickBooksSyncCheckpointListResponse,
  HandrailQuickBooksSyncCheckpointMetadata,
  HandrailQuickBooksSyncJobListResponse,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTokenStatusResponse,
  HandrailQuickBooksTransaction,
  HandrailQuickBooksTransactionListResponse,
  HandrailQuickBooksTrialBalanceLine,
  HandrailQuickBooksTrialBalanceReport,
  HandrailQuickBooksTrialBalanceRequest,
  ListAccountsRequest,
  ListClassesRequest,
  ListItemsRequest,
  ListLocationsRequest,
  ListPartiesRequest,
  ListTransactionsRequest
} from "@handrail/quickbooks-node-sdk";

const config: HandrailQuickBooksSdkConfigInput = {
  auth: {
    scheme: "bearer",
    token: "service-token"
  },
<<<<<<< HEAD
  providerMode: "sandbox",
  serviceEnv: "staging",
=======
  baseUrl: "https://quickbooks.example.test",
  providerMode: "sandbox",
>>>>>>> origin/main
  tenantId: "tenant_123"
};

const futureErpTenantMapContractId: HandrailQuickBooksFutureErpTenantMapContractId =
  "future-erp.quickbooks-tenant-mapping.v1";
const futureErpTenantMappingStatus: HandrailQuickBooksFutureErpTenantMappingStatus = "active";
const futureErpTenantContext: HandrailQuickBooksFutureErpTenantContext = {
  futureErpAccountId: "acct_alpha",
  futureErpCompanyId: "company_alpha"
};
const futureErpTenantMapping: HandrailQuickBooksFutureErpTenantMapping = {
  ...futureErpTenantContext,
  serviceTenantId: "tenant_123",
  status: futureErpTenantMappingStatus
};
const futureErpTenantMap: HandrailQuickBooksFutureErpTenantMap = {
  contractId: futureErpTenantMapContractId,
  consumerProject: "Hitcents Future ERP",
  providerMode: "sandbox",
  schemaVersion: 1,
  serviceEnv: "staging",
  sourceOfTruth: "Handrail QuickBooks Integration service",
  tenantMappings: [futureErpTenantMapping]
};
const futureErpResolveOptions: HandrailQuickBooksFutureErpTenantMapResolveOptions = {
  providerMode: "sandbox",
  serviceEnv: "staging"
};
const parsedFutureErpTenantMap = parseFutureErpQuickBooksTenantMapJson(
  JSON.stringify(futureErpTenantMap)
);
const resolvedFutureErpTenantId = resolveFutureErpQuickBooksTenantId(
  parsedFutureErpTenantMap,
  futureErpTenantContext,
  futureErpResolveOptions
);
const futureErpConfig: HandrailQuickBooksSdkConfigInput = {
  apiKey: "service-api-key",
  futureErpTenantContext,
  providerMode: "sandbox",
  serviceEnv: "staging",
  tenantMap: parsedFutureErpTenantMap
};

const listRequest: HandrailQuickBooksListRequest = {
  cursor: "cursor_123",
  limit: 25
};

const pageInfo: HandrailQuickBooksPageInfo = {
  cursor: "cursor_next",
  hasMore: false,
  limit: 25
};

const accountRequest: ListAccountsRequest = { active: true, accountType: "Bank", ...listRequest };
const itemRequest: ListItemsRequest = { active: true, ...listRequest };
const classRequest: ListClassesRequest = { active: true, ...listRequest };
const locationRequest: ListLocationsRequest = { active: true, ...listRequest };
const partyRequest: ListPartiesRequest = { partyType: "customer", ...listRequest };
const transactionRequest: ListTransactionsRequest = { transactionType: "payment", ...listRequest };
const ledgerSearchRequest: HandrailQuickBooksLedgerSearchRequest = {
  accountId: "account_100",
  from: "2026-05-01",
  to: "2026-05-31"
};

const audit: HandrailQuickBooksAuditReference = {
  checkpointId: "checkpoint_123",
  importBatchId: "batch_123",
  realmId: "realm_123",
  sourcePayloadRefs: ["raw://batch_123/object/Account/100"]
};

const retry: HandrailQuickBooksRetryState = {
  attemptCount: 1,
  lastErrorCode: "quickbooks_fetch_failed",
  maxAttempts: 3,
  retryReason: "transient_provider_failure",
  retryable: true,
  source: "raw_import"
};

const deltaCounts: HandrailQuickBooksDeltaSyncCounts = {
  changedCount: 1,
  failedCount: 0,
  insertedCount: 2,
  retryPendingCount: 0,
  skippedCount: 3,
  unchangedCount: 3,
  updatedCount: 1
};

const providerEnvironment: HandrailQuickBooksProviderEnvironment = "sandbox";
const providerMode: HandrailQuickBooksProviderMode = "sandbox";
const reportedProviderMode: HandrailQuickBooksReportedProviderMode = "unavailable";
const connectionStatus: HandrailQuickBooksConnectionStatus = "connected";
const reportName: HandrailQuickBooksReportName = "profit_and_loss";
const drilldownReference: HandrailQuickBooksReportDrilldownReference = {
  drilldownId: "drilldown_report_line_income",
  type: "report_line"
};
const reportLine: HandrailQuickBooksReportLine = {
  amount: "100.00",
  drilldown: drilldownReference,
  id: "line_income",
  label: "Income",
  lineType: "detail"
};
const reportTotal: HandrailQuickBooksReportTotal = {
  amount: "100.00",
  drilldown: drilldownReference,
  label: "Net income"
};
const snapshotMetadata: HandrailQuickBooksReportSnapshotMetadata = {
  checkpointRefs: ["checkpoint://quickbooks/tenant_123/checkpoint_123"],
  realmId: "realm_123",
  reportSnapshotId: "snapshot_123",
  reportSnapshotRef: "report://quickbooks/tenant_123/profit-and-loss/snapshot_123",
  sourceRefs: ["raw://batch_123/reports/profit-and-loss/2026-05"]
};
const checkpointMetadata: HandrailQuickBooksSyncCheckpointMetadata = {
  audit,
  checkpointId: "checkpoint_123",
  checkpointKind: "provider_updated_at_watermark",
  checkpointRef: "checkpoint://quickbooks/tenant_123/checkpoint_123",
  cursorRefs: ["cursor://quickbooks/tenant_123/accounts"],
  entity: "accounts",
  importBatchId: "batch_123",
  jobIds: ["job_123"],
  objectType: "Account",
  startedAt: "2026-05-31T00:00:00.000Z",
  status: "succeeded",
  syncJobRefs: ["sync-job://quickbooks/tenant_123/job_123"],
  syncMode: "incremental"
};
const checkpoint: HandrailQuickBooksSyncCheckpoint = {
  ...checkpointMetadata,
  companyId: "realm_123",
  deltaCounts,
  realmId: "realm_123",
  tenantId: "tenant_123"
};
const importBatch: HandrailQuickBooksImportBatchSummary = {
  audit,
  checkpointRefs: ["checkpoint://quickbooks/tenant_123/checkpoint_123"],
  companyId: "realm_123",
  deltaCounts,
  entityCounts: { accounts: 2 },
  errorCount: 0,
  importBatchId: "batch_123",
  jobIds: ["job_123"],
  objectCounts: { Account: 2 },
  realmId: "realm_123",
  startedAt: "2026-05-31T00:00:00.000Z",
  status: "succeeded",
  syncJobRefs: ["sync-job://quickbooks/tenant_123/job_123"],
  tenantId: "tenant_123",
  totalObjectCount: 2,
  warningCount: 0
};
const syncJob: HandrailQuickBooksSyncJobSummary = {
  audit,
  batch: importBatch,
  checkpoint: checkpointMetadata,
  companyId: "realm_123",
  deltaCounts,
  entity: "accounts",
  importBatchId: "batch_123",
  importVolume: {
    entityCounts: { accounts: 2 },
    errorCount: 0,
    objectCount: 2,
    objectCounts: { Account: 2 },
    totalObjectCount: 2,
    warningCount: 0
  },
  jobId: "job_123",
  objectCount: 2,
  objectType: "Account",
  retry,
  startedAt: "2026-05-31T00:00:00.000Z",
  status: "succeeded",
  syncMode: "incremental",
  syncPhase: "delta_sync",
  tenantId: "tenant_123"
};

declare const account: HandrailQuickBooksAccount;
declare const item: HandrailQuickBooksItem;
declare const classObject: HandrailQuickBooksClass;
declare const location: HandrailQuickBooksLocation;
declare const party: HandrailQuickBooksParty;
declare const transaction: HandrailQuickBooksTransaction;
declare const ledgerEntry: HandrailQuickBooksLedgerEntry;

const normalizedResources: readonly HandrailQuickBooksNormalizedResource[] = [
  account,
  item,
  classObject,
  location,
  party,
  transaction,
  ledgerEntry
];

const accountList: HandrailQuickBooksAccountListResponse = { data: [account], page: pageInfo };
const itemList: HandrailQuickBooksItemListResponse = { data: [item], page: pageInfo };
const classList: HandrailQuickBooksClassListResponse = { data: [classObject], page: pageInfo };
const locationList: HandrailQuickBooksLocationListResponse = { data: [location], page: pageInfo };
const partyList: HandrailQuickBooksPartyListResponse = { data: [party], page: pageInfo };
const transactionList: HandrailQuickBooksTransactionListResponse = {
  data: [transaction],
  page: pageInfo
};
const ledgerList: HandrailQuickBooksLedgerEntryListResponse = {
  data: [ledgerEntry],
  page: pageInfo
};
const genericList: HandrailQuickBooksListResponse<HandrailQuickBooksNormalizedResource> = {
  data: normalizedResources,
  page: pageInfo
};
const syncJobList: HandrailQuickBooksSyncJobListResponse = { data: [syncJob], page: pageInfo };
const checkpointList: HandrailQuickBooksSyncCheckpointListResponse = {
  data: [checkpoint],
  page: pageInfo
};
const importBatchList: HandrailQuickBooksImportBatchListResponse = {
  data: [importBatch],
  page: pageInfo
};
const rawImportStatus: HandrailQuickBooksRawImportStatus = {
  audit,
  checkpoint: checkpointMetadata,
  companyId: "realm_123",
  deltaCounts,
  entity: "accounts",
  errorCount: 0,
  importBatchId: "batch_123",
  importVolume: syncJob.importVolume,
  objectCount: 2,
  objectType: "Account",
  startedAt: "2026-05-31T00:00:00.000Z",
  status: "completed",
  syncMode: "full",
  syncPhase: "initial_load",
  tenantId: "tenant_123",
  warningCount: 0
};
const rawImportList: HandrailQuickBooksRawImportStatusListResponse = {
  data: [rawImportStatus],
  page: pageInfo
};

const trialBalanceRequest: HandrailQuickBooksTrialBalanceRequest = { asOfDate: "2026-05-31" };
const profitAndLossRequest: HandrailQuickBooksProfitAndLossRequest = {
  period: { endDate: "2026-05-31", startDate: "2026-05-01" }
};
const balanceSheetRequest: HandrailQuickBooksBalanceSheetRequest = { asOfDate: "2026-05-31" };
const cashFlowRequest: HandrailQuickBooksCashFlowRequest = profitAndLossRequest;
const generalLedgerRequest: HandrailQuickBooksGeneralLedgerRequest = {
  ...profitAndLossRequest,
  accountId: "account_100"
};
const agingRequest: HandrailQuickBooksAgingReportRequest = {
  asOfDate: "2026-05-31",
  bucketDays: [30, 60, 90]
};

const trialBalanceLine: HandrailQuickBooksTrialBalanceLine = {
  accountId: "account_100",
  accountName: "Checking",
  credit: "0.00",
  debit: "100.00"
};
const trialBalanceReport: HandrailQuickBooksTrialBalanceReport = {
  ...snapshotMetadata,
  generatedAt: "2026-05-31T00:00:00.000Z",
  lines: [trialBalanceLine],
  name: "trial_balance",
  period: { endDate: "2026-05-31", startDate: "2026-05-31" },
  tenantId: "tenant_123"
};
declare const profitAndLossReport: HandrailQuickBooksProfitAndLossReport;
declare const balanceSheetReport: HandrailQuickBooksBalanceSheetReport;
declare const cashFlowReport: HandrailQuickBooksCashFlowReport;
declare const generalLedgerReport: HandrailQuickBooksGeneralLedgerReport;
declare const arAgingReport: HandrailQuickBooksAccountsReceivableAgingReport;
declare const apAgingReport: HandrailQuickBooksAccountsPayableAgingReport;

const reportRequests: readonly HandrailQuickBooksReportRequest[] = [
  trialBalanceRequest,
  profitAndLossRequest,
  balanceSheetRequest,
  cashFlowRequest,
  generalLedgerRequest,
  agingRequest
];
const reportResponses: readonly HandrailQuickBooksReportResponse[] = [
  trialBalanceReport,
  profitAndLossReport,
  balanceSheetReport,
  cashFlowReport,
  generalLedgerReport,
  arAgingReport,
  apAgingReport
];

const connection: HandrailQuickBooksConnectionStatusResponse = {
  providerEnvironment,
  providerMode,
  status: connectionStatus,
  tenantId: "tenant_123"
};
const tokenStatus: HandrailQuickBooksTokenStatusResponse = {
  audit,
  status: "healthy",
  tenantId: "tenant_123"
};
const drilldownRequest: HandrailQuickBooksDrilldownRequest = {
  id: drilldownReference.drilldownId,
  type: drilldownReference.type
};
const drilldownResult: HandrailQuickBooksDrilldownResult = {
  ...snapshotMetadata,
  id: drilldownRequest.id,
  relatedLedgerEntries: [ledgerEntry],
  relatedReportLines: [reportLine],
  reportName,
  type: drilldownRequest.type
};
const syncRequest: HandrailQuickBooksStartSyncRequest = {
  entities: ["accounts", "parties", "transactions", "ledger_entries"],
  mode: "incremental",
  since: "2026-05-01T00:00:00.000Z"
};
const requestOptions: HandrailQuickBooksRequestOptions = {
  idempotencyKey: "future-erp-reconcile",
  method: "POST"
};

void [
  accountRequest,
  itemRequest,
  classRequest,
  locationRequest,
  partyRequest,
  transactionRequest,
  ledgerSearchRequest,
  accountList,
  itemList,
  classList,
  locationList,
  partyList,
  transactionList,
  ledgerList,
  genericList,
  syncJobList,
  checkpointList,
  importBatchList,
  rawImportList,
  reportRequests,
  reportResponses,
  connection,
  tokenStatus,
  drilldownResult,
  syncRequest,
  requestOptions,
  config,
  futureErpConfig,
  resolvedFutureErpTenantId,
  reportedProviderMode,
  reportTotal
];
