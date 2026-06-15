import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksConnectUrlRequest,
  HandrailQuickBooksConnectUrlResponse,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksRawImportStatus,
  HandrailQuickBooksReconciliationRequest,
  HandrailQuickBooksReconciliationResult,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTokenStatusResponse,
  HandrailQuickBooksTrialBalanceRequest,
  HandrailQuickBooksTrialBalanceReport
} from "../types.js";

export interface CliOutput {
  write(chunk: string): void;
}

export interface CliGlobalConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
  readonly retries?: number;
  readonly tenantId?: string;
  readonly timeoutMs?: number;
}

export interface CliQuickBooksClient {
  readonly accounts: {
    list(request?: HandrailQuickBooksListRequest): Promise<HandrailQuickBooksListResponse<HandrailQuickBooksAccount>>;
  };
  readonly connections: {
    connectUrl(request?: HandrailQuickBooksConnectUrlRequest): Promise<HandrailQuickBooksConnectUrlResponse>;
    status(): Promise<HandrailQuickBooksConnectionStatusResponse>;
    tokenStatus(): Promise<HandrailQuickBooksTokenStatusResponse>;
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
