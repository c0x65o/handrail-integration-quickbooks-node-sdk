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
  | HandrailQuickBooksRawImportEntity
  | "reports"
  | "reconciliation"
  | "drilldowns";

export type HandrailQuickBooksRawImportEntity =
  | "accounts"
  | "parties"
  | "transactions"
  | "ledger_entries";

export type HandrailQuickBooksRawImportObjectType =
  | "Account"
  | "Bill"
  | "BillPayment"
  | "CreditMemo"
  | "Customer"
  | "Deposit"
  | "Invoice"
  | "JournalEntry"
  | "Payment"
  | "Purchase"
  | "RefundReceipt"
  | "SalesReceipt"
  | "Transfer"
  | "Vendor"
  | "VendorCredit";

export type HandrailQuickBooksReportName =
  | "accounts_payable_aging"
  | "accounts_receivable_aging"
  | "balance_sheet"
  | "cash_flow"
  | "general_ledger"
  | "profit_and_loss"
  | "trial_balance";

export type HandrailQuickBooksAccountingBasis = "accrual" | "cash";

export interface HandrailQuickBooksAuditReference {
  readonly checkpointId?: string;
  readonly importBatchId?: string;
  readonly jobId?: string;
  readonly qboObjectId?: string;
  readonly realmId?: string;
  readonly sourcePayloadRef?: string;
  readonly sourcePayloadRefs?: readonly string[];
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
  readonly tenantId: string;
  readonly jobId: string;
  readonly status: HandrailQuickBooksSyncJobStatus;
  readonly companyId: string;
  readonly entity: HandrailQuickBooksRawImportEntity;
  readonly importBatchId: string;
  readonly batch?: HandrailQuickBooksImportBatchSummary;
  readonly syncMode: HandrailQuickBooksSyncCheckpointMode;
  readonly syncPhase: HandrailQuickBooksSyncPhase;
  readonly importVolume: HandrailQuickBooksImportVolumeSummary;
  readonly deltaCounts: HandrailQuickBooksDeltaSyncCounts;
  readonly checkpoint?: HandrailQuickBooksSyncCheckpointMetadata;
  readonly objectCount: number;
  readonly objectType: HandrailQuickBooksRawImportObjectType;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly retry?: HandrailQuickBooksRetryState;
  readonly audit: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksStartSyncRequest {
  readonly entities?: readonly HandrailQuickBooksRawImportEntity[];
  readonly importBatchId?: string;
  readonly mode?: "incremental" | "full";
  readonly since?: string;
}

export type HandrailQuickBooksDeltaSyncCounts = {
  readonly skippedCount: number;
  readonly changedCount: number;
  readonly insertedCount: number;
  readonly failedCount: number;
};

export type HandrailQuickBooksSyncPhase = "initial_load" | "delta_sync";

export type HandrailQuickBooksImportBatchStatus =
  | "running"
  | "succeeded"
  | "failed"
  | "partial_failed";

export type HandrailQuickBooksSyncCheckpointMode = "full" | "incremental";

export type HandrailQuickBooksSyncCheckpointKind = "provider_updated_at_watermark";

export type HandrailQuickBooksSyncCheckpointStatus = "running" | "succeeded" | "failed";

export interface HandrailQuickBooksImportVolumeSummary {
  readonly objectCount: number;
  readonly objectCounts: Partial<Record<HandrailQuickBooksRawImportObjectType, number>>;
  readonly entityCounts: Partial<Record<HandrailQuickBooksRawImportEntity, number>>;
  readonly totalObjectCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
}

export interface HandrailQuickBooksSyncCheckpointMetadata {
  readonly checkpointId: string;
  readonly checkpointRef: string;
  readonly checkpointKind: HandrailQuickBooksSyncCheckpointKind;
  readonly syncMode: HandrailQuickBooksSyncCheckpointMode;
  readonly entity: HandrailQuickBooksRawImportEntity;
  readonly objectType: HandrailQuickBooksRawImportObjectType;
  readonly providerUpdatedAtWatermark?: string;
  readonly cursorRefs: readonly string[];
  readonly importBatchId: string;
  readonly jobIds: readonly string[];
  readonly syncJobRefs: readonly string[];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly status: HandrailQuickBooksSyncCheckpointStatus;
  readonly audit: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksImportBatchSummary {
  readonly tenantId: string;
  readonly realmId: string;
  readonly companyId: string;
  readonly importBatchId: string;
  readonly jobIds: readonly string[];
  readonly syncJobRefs: readonly string[];
  readonly checkpointRefs: readonly string[];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly status: HandrailQuickBooksImportBatchStatus;
  readonly objectCounts: Partial<Record<HandrailQuickBooksRawImportObjectType, number>>;
  readonly entityCounts: Partial<Record<HandrailQuickBooksRawImportEntity, number>>;
  readonly totalObjectCount: number;
  readonly deltaCounts: HandrailQuickBooksDeltaSyncCounts;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly audit: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksSyncCheckpoint {
  readonly tenantId: string;
  readonly realmId: string;
  readonly companyId: string;
  readonly checkpointId: string;
  readonly checkpointKind: HandrailQuickBooksSyncCheckpointKind;
  readonly syncMode: HandrailQuickBooksSyncCheckpointMode;
  readonly entity: HandrailQuickBooksRawImportEntity;
  readonly objectType: HandrailQuickBooksRawImportObjectType;
  readonly providerUpdatedAtWatermark?: string;
  readonly deltaCounts: HandrailQuickBooksDeltaSyncCounts;
  readonly importBatchId: string;
  readonly jobIds: readonly string[];
  readonly syncJobRefs: readonly string[];
  readonly cursorRefs: readonly string[];
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly status: HandrailQuickBooksSyncCheckpointStatus;
  readonly audit: HandrailQuickBooksAuditReference;
}

export interface HandrailQuickBooksCheckpointListRequest extends HandrailQuickBooksListRequest {
  readonly entity?: HandrailQuickBooksRawImportEntity;
  readonly objectType?: HandrailQuickBooksRawImportObjectType;
  readonly syncMode?: HandrailQuickBooksSyncCheckpointMode;
}

export type HandrailQuickBooksImportBatchListRequest = HandrailQuickBooksListRequest;

export interface HandrailQuickBooksRawImportStatus {
  readonly tenantId: string;
  readonly companyId: string;
  readonly completedAt?: string;
  readonly entity: HandrailQuickBooksRawImportEntity;
  readonly syncMode: HandrailQuickBooksSyncCheckpointMode;
  readonly syncPhase: HandrailQuickBooksSyncPhase;
  readonly importVolume: HandrailQuickBooksImportVolumeSummary;
  readonly deltaCounts: HandrailQuickBooksDeltaSyncCounts;
  readonly checkpoint?: HandrailQuickBooksSyncCheckpointMetadata;
  readonly errorCount: number;
  readonly importBatchId: string;
  readonly objectCount: number;
  readonly objectType: HandrailQuickBooksRawImportObjectType;
  readonly startedAt: string;
  readonly status: "queued" | "importing" | "normalizing" | "completed" | "failed";
  readonly retry?: HandrailQuickBooksRetryState;
  readonly warningCount: number;
  readonly audit: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksAccountingReference = {
  readonly value?: string;
  readonly name?: string;
};

export type HandrailQuickBooksAccountingCurrencyReference = HandrailQuickBooksAccountingReference;

export interface HandrailQuickBooksProviderMetadata {
  readonly tenantId: string;
  readonly realmId: string;
  readonly companyId: string;
  readonly provider: "intuit";
  readonly providerEnvironment: HandrailQuickBooksProviderEnvironment;
  readonly source: "quickbooks_accounting_api";
  readonly sourceObjectId: string;
  readonly importBatchId: string;
  readonly jobId: string;
  readonly importedAt: string;
  readonly syncedAt: string;
  readonly sourceUpdatedAt?: string;
  readonly audit: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksAccountType = string;

export interface HandrailQuickBooksAccount extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "Account";
  readonly name: string;
  readonly fullyQualifiedName?: string;
  readonly hierarchyPath?: readonly string[];
  readonly hierarchyLevel?: number;
  readonly accountType?: HandrailQuickBooksAccountType;
  readonly accountSubType?: string;
  readonly classification?: string;
  readonly active?: boolean;
  readonly subAccount?: boolean;
  readonly parentRef?: HandrailQuickBooksAccountingReference;
  readonly parentAccountId?: string;
  readonly parentAccountName?: string;
  readonly currentBalance?: number;
  readonly currentBalanceWithSubAccounts?: number;
  readonly currency?: HandrailQuickBooksAccountingCurrencyReference;
}

export type HandrailQuickBooksPartyType = "customer" | "vendor" | "employee" | "other";

export interface HandrailQuickBooksParty extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "Customer" | "Vendor";
  readonly displayName: string;
  readonly email?: string;
  readonly active?: boolean;
  readonly partyType: Extract<HandrailQuickBooksPartyType, "customer" | "vendor">;
  readonly companyName?: string;
}

export type HandrailQuickBooksTransactionSourceObject = Exclude<
  HandrailQuickBooksRawImportObjectType,
  "Account" | "Customer" | "JournalEntry" | "Vendor"
>;

export type HandrailQuickBooksTransactionType =
  | "bill"
  | "bill_payment"
  | "credit_memo"
  | "deposit"
  | "invoice"
  | "payment"
  | "purchase"
  | "refund_receipt"
  | "sales_receipt"
  | "transfer"
  | "vendor_credit";

export interface HandrailQuickBooksTransaction extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: HandrailQuickBooksTransactionSourceObject;
  readonly transactionType: HandrailQuickBooksTransactionType;
  readonly transactionDate?: string;
  readonly amount?: number;
  readonly currency?: HandrailQuickBooksAccountingCurrencyReference;
  readonly party?: HandrailQuickBooksAccountingReference;
  readonly documentNumber?: string;
  readonly privateNote?: string;
  readonly balance?: number;
}

export interface HandrailQuickBooksLedgerEntry extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "JournalEntry" | HandrailQuickBooksTransactionSourceObject;
  readonly transactionType: "journal_entry" | HandrailQuickBooksTransactionType;
  readonly transactionId: string;
  readonly lineId: string;
  readonly transactionDate?: string;
  readonly postedAt?: string;
  readonly documentNumber?: string;
  readonly account?: HandrailQuickBooksAccountingReference;
  readonly postingType?: string;
  readonly amount?: number;
  readonly currency?: HandrailQuickBooksAccountingCurrencyReference;
  readonly description?: string;
  readonly party?: HandrailQuickBooksAccountingReference;
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

export interface HandrailQuickBooksReportDrilldownReference {
  readonly drilldownId: string;
  readonly type: "account" | "party" | "transaction" | "ledger_entry" | "report_line" | "report_total";
}

export interface HandrailQuickBooksReportLine {
  readonly id: string;
  readonly accountId?: string;
  readonly accountName?: string;
  readonly amount: string;
  readonly children?: readonly HandrailQuickBooksReportLine[];
  readonly drilldown?: HandrailQuickBooksReportDrilldownReference;
  readonly label: string;
  readonly lineType: "detail" | "section" | "subtotal" | "total";
  readonly section?: string;
}

export interface HandrailQuickBooksReportTotal {
  readonly amount: string;
  readonly drilldown?: HandrailQuickBooksReportDrilldownReference;
  readonly label: string;
}

export interface HandrailQuickBooksFinancialStatementRequest {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly currencyCode?: string;
  readonly period: HandrailQuickBooksReportPeriod;
}

export interface HandrailQuickBooksAsOfReportRequest {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly asOfDate: string;
  readonly currencyCode?: string;
}

export interface HandrailQuickBooksTrialBalanceRequest {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
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
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly lines: readonly HandrailQuickBooksTrialBalanceLine[];
  readonly name: "trial_balance";
  readonly period: HandrailQuickBooksReportPeriod;
  readonly tenantId: string;
  readonly audit?: HandrailQuickBooksAuditReference;
}

export type HandrailQuickBooksProfitAndLossRequest = HandrailQuickBooksFinancialStatementRequest;

export interface HandrailQuickBooksProfitAndLossReport {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly lines: readonly HandrailQuickBooksReportLine[];
  readonly name: "profit_and_loss";
  readonly period: HandrailQuickBooksReportPeriod;
  readonly tenantId: string;
  readonly totals: {
    readonly grossProfit?: HandrailQuickBooksReportTotal;
    readonly netIncome: HandrailQuickBooksReportTotal;
    readonly totalExpenses?: HandrailQuickBooksReportTotal;
    readonly totalIncome?: HandrailQuickBooksReportTotal;
  };
}

export type HandrailQuickBooksBalanceSheetRequest = HandrailQuickBooksAsOfReportRequest;

export interface HandrailQuickBooksBalanceSheetReport {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly asOfDate: string;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly lines: readonly HandrailQuickBooksReportLine[];
  readonly name: "balance_sheet";
  readonly tenantId: string;
  readonly totals: {
    readonly totalAssets: HandrailQuickBooksReportTotal;
    readonly totalEquity: HandrailQuickBooksReportTotal;
    readonly totalLiabilities: HandrailQuickBooksReportTotal;
    readonly totalLiabilitiesAndEquity: HandrailQuickBooksReportTotal;
  };
}

export type HandrailQuickBooksCashFlowRequest = HandrailQuickBooksFinancialStatementRequest;

export interface HandrailQuickBooksCashFlowReport {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly lines: readonly HandrailQuickBooksReportLine[];
  readonly name: "cash_flow";
  readonly period: HandrailQuickBooksReportPeriod;
  readonly tenantId: string;
  readonly totals: {
    readonly cashAtBeginningOfPeriod?: HandrailQuickBooksReportTotal;
    readonly cashAtEndOfPeriod?: HandrailQuickBooksReportTotal;
    readonly netCashChange: HandrailQuickBooksReportTotal;
  };
}

export interface HandrailQuickBooksGeneralLedgerRequest extends HandrailQuickBooksFinancialStatementRequest {
  readonly accountId?: string;
  readonly partyId?: string;
  readonly transactionId?: string;
}

export interface HandrailQuickBooksGeneralLedgerRow {
  readonly accountId: string;
  readonly accountName: string;
  readonly amount: string;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly balance?: string;
  readonly credit?: string;
  readonly currencyCode?: string;
  readonly debit?: string;
  readonly description?: string;
  readonly documentNumber?: string;
  readonly drilldown?: HandrailQuickBooksReportDrilldownReference;
  readonly ledgerEntryId: string;
  readonly partyId?: string;
  readonly partyName?: string;
  readonly transactionDate?: string;
  readonly transactionId: string;
  readonly transactionType: HandrailQuickBooksLedgerEntry["transactionType"];
}

export interface HandrailQuickBooksGeneralLedgerReport {
  readonly accountingBasis?: HandrailQuickBooksAccountingBasis;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly closingBalance?: string;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly name: "general_ledger";
  readonly openingBalance?: string;
  readonly period: HandrailQuickBooksReportPeriod;
  readonly rows: readonly HandrailQuickBooksGeneralLedgerRow[];
  readonly tenantId: string;
  readonly totals: {
    readonly credits: HandrailQuickBooksReportTotal;
    readonly debits: HandrailQuickBooksReportTotal;
    readonly netChange: HandrailQuickBooksReportTotal;
  };
}

export interface HandrailQuickBooksAgingReportRequest extends HandrailQuickBooksAsOfReportRequest {
  readonly bucketDays?: readonly number[];
}

export interface HandrailQuickBooksAgingRow {
  readonly current: string;
  readonly days1To30: string;
  readonly days31To60: string;
  readonly days61To90: string;
  readonly drilldown?: HandrailQuickBooksReportDrilldownReference;
  readonly over90: string;
  readonly partyId: string;
  readonly partyName: string;
  readonly total: string;
}

export interface HandrailQuickBooksAgingTotals {
  readonly current: string;
  readonly days1To30: string;
  readonly days31To60: string;
  readonly days61To90: string;
  readonly over90: string;
  readonly total: string;
  readonly drilldown?: HandrailQuickBooksReportDrilldownReference;
}

export interface HandrailQuickBooksAccountsReceivableAgingReport {
  readonly asOfDate: string;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly name: "accounts_receivable_aging";
  readonly rows: readonly HandrailQuickBooksAgingRow[];
  readonly tenantId: string;
  readonly totals: HandrailQuickBooksAgingTotals;
}

export interface HandrailQuickBooksAccountsPayableAgingReport {
  readonly asOfDate: string;
  readonly audit?: HandrailQuickBooksAuditReference;
  readonly currencyCode?: string;
  readonly generatedAt: string;
  readonly name: "accounts_payable_aging";
  readonly rows: readonly HandrailQuickBooksAgingRow[];
  readonly tenantId: string;
  readonly totals: HandrailQuickBooksAgingTotals;
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
  readonly type: "account" | "party" | "transaction" | "ledger_entry" | "report_line" | "report_total";
}

export interface HandrailQuickBooksDrilldownResult {
  readonly id: string;
  readonly generatedAt?: string;
  readonly relatedAuditReferences?: readonly HandrailQuickBooksAuditReference[];
  readonly relatedAccounts?: readonly HandrailQuickBooksAccount[];
  readonly relatedLedgerEntries?: readonly HandrailQuickBooksLedgerEntry[];
  readonly relatedParties?: readonly HandrailQuickBooksParty[];
  readonly relatedReportLines?: readonly HandrailQuickBooksReportLine[];
  readonly relatedTransactions?: readonly HandrailQuickBooksTransaction[];
  readonly reportName?: HandrailQuickBooksReportName;
  readonly tenantId?: string;
  readonly type: HandrailQuickBooksDrilldownRequest["type"];
  readonly audit?: HandrailQuickBooksAuditReference;
}
