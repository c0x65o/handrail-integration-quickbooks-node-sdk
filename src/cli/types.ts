import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksAccountsPayableAgingReport,
  HandrailQuickBooksAccountsReceivableAgingReport,
  HandrailQuickBooksAgingReportRequest,
  HandrailQuickBooksBalanceSheetReport,
  HandrailQuickBooksBalanceSheetRequest,
  HandrailQuickBooksCashFlowReport,
  HandrailQuickBooksCashFlowRequest,
  HandrailQuickBooksCheckpointListRequest,
  HandrailQuickBooksClass,
  HandrailQuickBooksConnectUrlRequest,
  HandrailQuickBooksConnectUrlResponse,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksGeneralLedgerReport,
  HandrailQuickBooksGeneralLedgerRequest,
  HandrailQuickBooksImportBatchListRequest,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksItem,
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksLocation,
  HandrailQuickBooksParty,
  HandrailQuickBooksProfitAndLossReport,
  HandrailQuickBooksProfitAndLossRequest,
  HandrailQuickBooksProviderMode,
  HandrailQuickBooksRawImportStatus,
  HandrailQuickBooksReconciliationRequest,
  HandrailQuickBooksReconciliationResult,
  HandrailQuickBooksServiceEnv,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncCheckpoint,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTokenStatusResponse,
  HandrailQuickBooksTransaction,
  HandrailQuickBooksTrialBalanceRequest,
  HandrailQuickBooksTrialBalanceReport
} from "../types.js";

export interface CliOutput {
  write(chunk: string): void;
}

export interface CliGlobalConfig {
  readonly apiKey?: string;
  readonly baseUrlOverride?: CliBaseUrlOverrideDiagnostic;
  readonly baseUrl?: string;
  readonly providerMode?: HandrailQuickBooksProviderMode;
  readonly retries?: number;
  readonly serviceEnv?: HandrailQuickBooksServiceEnv;
  readonly tenantId?: string;
  readonly tenantMapJson?: string;
  readonly timeoutMs?: number;
}

export interface CliBaseUrlOverrideDiagnostic {
  readonly envName: "HANDRAIL_QBO_BASE_URL";
  readonly flagName: "--base-url";
  readonly present: true;
  readonly scope: "local_operator_override_only";
}

export interface CliQuickBooksClient {
  readonly accounts: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksAccount>>;
  };
  readonly checkpoints: {
    get(checkpointId: string): Promise<HandrailQuickBooksSyncCheckpoint>;
    list(request?: HandrailQuickBooksCheckpointListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksSyncCheckpoint>>;
  };
  readonly classes: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksClass>>;
  };
  readonly connections: {
    connectUrl(request?: HandrailQuickBooksConnectUrlRequest): Promise<HandrailQuickBooksConnectUrlResponse>;
    status(): Promise<HandrailQuickBooksConnectionStatusResponse>;
    tokenStatus(): Promise<HandrailQuickBooksTokenStatusResponse>;
  };
  readonly importBatches: {
    get(importBatchId: string): Promise<HandrailQuickBooksImportBatchSummary>;
    list(request?: HandrailQuickBooksImportBatchListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksImportBatchSummary>>;
  };
  readonly items: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksItem>>;
  };
  readonly ledgerEntries: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>>;
  };
  readonly locations: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksLocation>>;
  };
  readonly parties: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksParty>>;
  };
  readonly rawImports: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksRawImportStatus>>;
    status(importBatchId: string): Promise<HandrailQuickBooksRawImportStatus>;
  };
  readonly reconciliation: {
    run(
      request: HandrailQuickBooksReconciliationRequest,
      options?: { idempotencyKey?: string }
    ): Promise<HandrailQuickBooksReconciliationResult>;
  };
  readonly reports: {
    accountsPayableAging(request: HandrailQuickBooksAgingReportRequest): Promise<HandrailQuickBooksAccountsPayableAgingReport>;
    accountsReceivableAging(request: HandrailQuickBooksAgingReportRequest): Promise<HandrailQuickBooksAccountsReceivableAgingReport>;
    balanceSheet(request: HandrailQuickBooksBalanceSheetRequest): Promise<HandrailQuickBooksBalanceSheetReport>;
    cashFlow(request: HandrailQuickBooksCashFlowRequest): Promise<HandrailQuickBooksCashFlowReport>;
    generalLedger(request: HandrailQuickBooksGeneralLedgerRequest): Promise<HandrailQuickBooksGeneralLedgerReport>;
    profitAndLoss(request: HandrailQuickBooksProfitAndLossRequest): Promise<HandrailQuickBooksProfitAndLossReport>;
    trialBalance(request: HandrailQuickBooksTrialBalanceRequest): Promise<HandrailQuickBooksTrialBalanceReport>;
  };
  readonly syncJobs: {
    get(jobId: string): Promise<HandrailQuickBooksSyncJobSummary>;
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksSyncJobSummary>>;
    start(
      request?: HandrailQuickBooksStartSyncRequest,
      options?: { idempotencyKey?: string }
    ): Promise<HandrailQuickBooksSyncJobSummary>;
  };
  readonly transactions: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksTransaction>>;
  };
}

export interface CliCommandContext {
  readonly client: CliQuickBooksClient;
  readonly config: CliGlobalConfig;
  readonly flags: ReadonlyMap<string, string | true>;
  readonly positionals: readonly string[];
  readonly stderr: CliOutput;
  readonly stdout: CliOutput;
}

export interface CliCommandDefinition {
  readonly aliases?: readonly string[];
  readonly description: string;
  readonly help?: boolean;
  readonly name: string;
  readonly run: (context: CliCommandContext) => Promise<unknown>;
  readonly usage: string;
}
