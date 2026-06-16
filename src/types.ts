export interface HandrailQuickBooksSdkConfigInput {
  readonly apiKey?: string;
  readonly auth?: HandrailQuickBooksAuthConfig;
  readonly baseUrl?: string;
  readonly fetch?: HandrailQuickBooksFetch;
  readonly retries?: number;
  readonly tenantId?: string;
  readonly timeoutMs?: number;
}

export interface HandrailQuickBooksClientConfig {
  readonly apiKey?: string;
  readonly auth?: HandrailQuickBooksAuthConfig;
  readonly baseUrl: string;
  readonly fetch?: HandrailQuickBooksFetch;
  readonly retries: number;
  readonly tenantId?: string;
  readonly timeoutMs: number;
}

export interface HandrailQuickBooksAuthConfig {
  readonly headerName?: string;
  readonly scheme?: "bearer" | "api-key";
  readonly token: string;
}

export type HandrailQuickBooksFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export interface HandrailQuickBooksPageInfo {
  readonly cursor?: string;
  readonly hasMore: boolean;
  readonly limit?: number;
}

export type HandrailQuickBooksQueryValue = boolean | number | string | null | undefined;

export interface HandrailQuickBooksListRequest {
  readonly [key: string]: HandrailQuickBooksQueryValue;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface HandrailQuickBooksListResponse<TItem> {
  readonly data: readonly TItem[];
  readonly page?: HandrailQuickBooksPageInfo;
}

export type HandrailQuickBooksConnectionStatus =
  | "not_connected"
  | "pending"
  | "connected"
  | "reauthorization_required"
  | "disabled";

export type HandrailQuickBooksProviderEnvironment = "sandbox" | "production";

export type HandrailQuickBooksProviderProfileStatus =
  | "configured"
  | "missing"
  | "unknown";

export interface HandrailQuickBooksProviderProfileMetadata {
  readonly environment?: HandrailQuickBooksProviderEnvironment;
  readonly name?: string;
  readonly status?: HandrailQuickBooksProviderProfileStatus;
}

export type HandrailQuickBooksEntityName =
  | "accounts"
  | "parties"
  | "transactions"
  | "ledger_entries"
  | "reports"
  | "reconciliation"
  | "drilldowns";

export type HandrailQuickBooksReportName = "trial_balance" | "balance_sheet" | "profit_and_loss";

export interface HandrailQuickBooksAuditReference {
  readonly importBatchId?: string;
  readonly qboObjectId?: string;
  readonly realmId?: string;
  readonly sourcePayloadRef?: string;
  readonly syncToken?: string;
}

export interface HandrailQuickBooksConnectionSummary {
  readonly connectionId: string;
  readonly connectedAt?: string;
  readonly disabledAt?: string;
  readonly lastSyncedAt?: string;
  readonly status: HandrailQuickBooksConnectionStatus;
  readonly tenantId: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksConnectionStatusResponse {
  readonly connection?: HandrailQuickBooksConnectionSummary;
  readonly providerEnvironment?: HandrailQuickBooksProviderEnvironment;
  readonly providerProfile?: HandrailQuickBooksProviderProfileMetadata;
  readonly status: HandrailQuickBooksConnectionStatus;
  readonly tenantId: string;
}

export interface HandrailQuickBooksConnectUrlRequest {
  readonly connectionId?: string;
  readonly returnUrl?: string;
  readonly state?: string;
}

export interface HandrailQuickBooksConnectUrlResponse {
  readonly connectUrl: string;
  readonly expiresAt?: string;
  readonly tenantId: string;
}

export interface HandrailQuickBooksTokenStatusResponse {
  readonly connectionId?: string;
  readonly expiresAt?: string;
  readonly reauthorizationRequired?: boolean;
  readonly status: "healthy" | "expiring" | "reauthorization_required" | "unavailable";
  readonly tenantId: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksSyncJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type HandrailQuickBooksRetrySource = "raw_import" | "token_custody";

export type HandrailQuickBooksRetryLastErrorCode =
  | "quickbooks_connection_unavailable"
  | "quickbooks_fetch_failed"
  | "quickbooks_reauthorization_required";

export type HandrailQuickBooksRetryReason =
  | "connection_unavailable"
  | "provider_request_rejected"
  | "reauthorization_required"
  | "retry_exhausted"
  | "transient_provider_failure";

export interface HandrailQuickBooksRetryState {
  readonly source: HandrailQuickBooksRetrySource;
  readonly retryable: boolean;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextRetryAt?: string;
  readonly lastErrorCode: HandrailQuickBooksRetryLastErrorCode;
  readonly retryReason: HandrailQuickBooksRetryReason;
}

export interface HandrailQuickBooksSyncJobSummary {
  readonly jobId: string;
  readonly status: HandrailQuickBooksSyncJobStatus;
  readonly companyId?: string;
  readonly entity?: HandrailQuickBooksEntityName;
  readonly importBatchId?: string;
  readonly objectCount?: number;
  readonly objectType?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly retry?: HandrailQuickBooksRetryState;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksStartSyncRequest {
  readonly entities?: readonly HandrailQuickBooksEntityName[];
  readonly importBatchId?: string;
  readonly mode?: "incremental" | "full";
  readonly since?: string;
}

export interface HandrailQuickBooksRawImportStatus {
  readonly companyId?: string;
  readonly completedAt?: string;
  readonly entity?: HandrailQuickBooksEntityName;
  readonly errorCount?: number;
  readonly importBatchId: string;
  readonly objectCount?: number;
  readonly objectType?: string;
  readonly startedAt?: string;
  readonly status: "queued" | "importing" | "normalizing" | "completed" | "failed";
  readonly retry?: HandrailQuickBooksRetryState;
  readonly warningCount?: number;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksAccountType =
  | "asset"
  | "liability"
  | "equity"
  | "income"
  | "expense"
  | "other";

export interface HandrailQuickBooksAccount {
  readonly id: string;
  readonly accountNumber?: string;
  readonly currencyCode?: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly parentId?: string;
  readonly subtype?: string;
  readonly type: HandrailQuickBooksAccountType;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksPartyType = "customer" | "vendor" | "employee" | "other";

export interface HandrailQuickBooksParty {
  readonly id: string;
  readonly displayName: string;
  readonly email?: string;
  readonly isActive: boolean;
  readonly type: HandrailQuickBooksPartyType;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksTransaction {
  readonly id: string;
  readonly amount: string;
  readonly currencyCode: string;
  readonly date: string;
  readonly memo?: string;
  readonly partyId?: string;
  readonly status?: "draft" | "posted" | "voided" | "deleted";
  readonly type: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksLedgerEntry {
  readonly id: string;
  readonly accountId: string;
  readonly amount: string;
  readonly currencyCode: string;
  readonly postedAt: string;
  readonly description?: string;
  readonly partyId?: string;
  readonly transactionId?: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksLedgerSearchRequest extends HandrailQuickBooksListRequest {
  readonly accountId?: string;
  readonly from?: string;
  readonly partyId?: string;
  readonly query?: string;
  readonly to?: string;
  readonly transactionId?: string;
}

export interface HandrailQuickBooksReportPeriod {
  readonly endDate: string;
  readonly startDate: string;
}

export interface HandrailQuickBooksTrialBalanceRequest {
  readonly accountingBasis?: "accrual" | "cash";
  readonly asOfDate: string;
  readonly currencyCode?: string;
}

export interface HandrailQuickBooksTrialBalanceLine {
  readonly accountId: string;
  readonly accountName: string;
  readonly credit: string;
  readonly debit: string;
}

export interface HandrailQuickBooksTrialBalanceReport {
  readonly generatedAt: string;
  readonly lines: readonly HandrailQuickBooksTrialBalanceLine[];
  readonly name: "trial_balance";
  readonly period: HandrailQuickBooksReportPeriod;
  readonly tenantId: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksReconciliationRequest {
  readonly accountId: string;
  readonly endingBalance: string;
  readonly period: HandrailQuickBooksReportPeriod;
}

export interface HandrailQuickBooksReconciliationResult {
  readonly accountId: string;
  readonly difference: string;
  readonly reconciliationId: string;
  readonly status: "balanced" | "out_of_balance" | "pending_review";
  readonly audit?: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksDrilldownRequest {
  readonly id: string;
  readonly type: "account" | "party" | "transaction" | "ledger_entry" | "report_line";
}

export interface HandrailQuickBooksDrilldownResult {
  readonly id: string;
  readonly relatedAccounts?: readonly HandrailQuickBooksAccount[];
  readonly relatedLedgerEntries?: readonly HandrailQuickBooksLedgerEntry[];
  readonly relatedParties?: readonly HandrailQuickBooksParty[];
  readonly relatedTransactions?: readonly HandrailQuickBooksTransaction[];
  readonly type: HandrailQuickBooksDrilldownRequest["type"];
  readonly audit?: HandrailQuickBooksAuditReference;
}
