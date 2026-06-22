export interface HandrailQuickBooksSdkConfigInput {
  readonly apiKey?: string;
  readonly auth?: HandrailQuickBooksAuthConfig;
  readonly baseUrl?: string;
  readonly fetch?: HandrailQuickBooksFetch;
  readonly futureErpTenantContext?: HandrailQuickBooksFutureErpTenantContext;
  readonly providerMode?: HandrailQuickBooksProviderMode;
  readonly retries?: number;
  readonly serviceEnv?: HandrailQuickBooksServiceEnv;
  readonly tenantId?: string;
  readonly tenantMap?: HandrailQuickBooksFutureErpTenantMap;
  readonly tenantMapJson?: string;
  readonly timeoutMs?: number;
}

export type HandrailQuickBooksServiceEnv = "dev" | "staging" | "production";

export interface HandrailQuickBooksClientConfig {
  readonly apiKey?: string;
  readonly auth?: HandrailQuickBooksAuthConfig;
  readonly baseUrl: string;
  readonly fetch?: HandrailQuickBooksFetch;
  readonly providerMode?: HandrailQuickBooksProviderMode;
  readonly retries: number;
  readonly serviceEnv?: HandrailQuickBooksServiceEnv;
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
export type HandrailQuickBooksProviderMode = HandrailQuickBooksProviderEnvironment;
export type HandrailQuickBooksReportedProviderMode =
  | HandrailQuickBooksProviderMode
  | "unavailable";

export type HandrailQuickBooksFutureErpTenantMapContractId =
  "future-erp.quickbooks-tenant-mapping.v1";

export type HandrailQuickBooksFutureErpTenantMappingStatus =
  | "active"
  | "disabled"
  | "pending_connection"
  | "reauthorization_required";

export interface HandrailQuickBooksFutureErpTenantContext {
  readonly futureErpAccountId: string;
  readonly futureErpCompanyId: string;
}

export interface HandrailQuickBooksFutureErpTenantMapping
  extends HandrailQuickBooksFutureErpTenantContext {
  readonly displayName?: string;
  readonly notes?: string;
  readonly serviceTenantId: string;
  readonly status: HandrailQuickBooksFutureErpTenantMappingStatus;
}

export interface HandrailQuickBooksFutureErpTenantMap {
  readonly schemaVersion: 1;
  readonly contractId: HandrailQuickBooksFutureErpTenantMapContractId;
  readonly consumerProject?: string;
  readonly sourceOfTruth?: string;
  readonly serviceEnv?: HandrailQuickBooksServiceEnv;
  readonly providerMode?: HandrailQuickBooksProviderMode;
  readonly tenantMappings: readonly HandrailQuickBooksFutureErpTenantMapping[];
}

export interface HandrailQuickBooksFutureErpTenantMapResolveOptions {
  readonly providerMode?: HandrailQuickBooksProviderMode;
  readonly serviceEnv?: HandrailQuickBooksServiceEnv;
}

export type HandrailQuickBooksProviderProfileStatus =
  | "configured"
  | "missing"
  | "unknown";

export interface HandrailQuickBooksHealthResponse {
  readonly ok: true;
  readonly service: "handrail-integration-quickbooks";
}

export interface HandrailQuickBooksProviderProfileMetadata {
  readonly environment?: HandrailQuickBooksProviderEnvironment;
  readonly name?: string;
  readonly status?: HandrailQuickBooksProviderProfileStatus;
}

export type HandrailQuickBooksEntityName =
  HandrailQuickBooksRawImportEntity;

export type HandrailQuickBooksRawImportEntity =
  | "accounts"
  | "classes"
  | "items"
  | "parties"
  | "transactions"
  | "locations"
  | "ledger_entries";

export type HandrailQuickBooksRawImportObjectType =
  | "Account"
  | "Bill"
  | "BillPayment"
  | "Class"
  | "CreditMemo"
  | "Customer"
  | "Department"
  | "Deposit"
  | "Invoice"
  | "Item"
  | "JournalEntry"
  | "Payment"
  | "Purchase"
  | "RefundReceipt"
  | "SalesReceipt"
  | "Transfer"
  | "Vendor"
  | "VendorCredit";

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
  readonly providerMode?: HandrailQuickBooksReportedProviderMode;
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
  readonly normalizedResources?: HandrailQuickBooksNormalizedResourceMap;
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

export type NormalizedQuickBooksFullSyncRequest =
  Omit<HandrailQuickBooksStartSyncRequest, "mode"> & {
    readonly mode?: "full";
  };

export type NormalizedQuickBooksIncrementalSyncRequest =
  Omit<HandrailQuickBooksStartSyncRequest, "mode"> & {
    readonly mode?: "incremental";
  };

export interface NormalizedQuickBooksSyncResponseEnvelopeBase {
  readonly contractId: "handrail.quickbooks.normalized-sync-envelope.v1";
  readonly tenantId: string;
  readonly companyId: string;
  readonly importBatchId: string;
  readonly jobId: string;
  readonly status: HandrailQuickBooksSyncJobStatus;
  readonly deltaCounts: HandrailQuickBooksDeltaSyncCounts;
  readonly importVolume: HandrailQuickBooksImportVolumeSummary;
  readonly normalizedResourceCounts: Partial<Record<HandrailQuickBooksRawImportEntity, number>>;
  readonly normalizedResources?: HandrailQuickBooksNormalizedResourceMap;
  readonly syncJob: HandrailQuickBooksSyncJobSummary;
  readonly importBatch?: HandrailQuickBooksImportBatchSummary;
  readonly checkpoint?: HandrailQuickBooksSyncCheckpointMetadata;
  readonly audit: HandrailQuickBooksAuditReference;
}

export interface NormalizedQuickBooksFullSyncResponseEnvelope
  extends NormalizedQuickBooksSyncResponseEnvelopeBase {
  readonly syncMode: "full";
  readonly syncPhase: "initial_load";
}

export interface NormalizedQuickBooksIncrementalSyncResponseEnvelope
  extends NormalizedQuickBooksSyncResponseEnvelopeBase {
  readonly syncMode: "incremental";
  readonly syncPhase: "delta_sync";
}

export type HandrailQuickBooksDeltaSyncCounts = {
  readonly skippedCount: number;
  readonly changedCount: number;
  readonly insertedCount: number;
  readonly failedCount: number;
  readonly retryPendingCount?: number;
  readonly unchangedCount?: number;
  readonly updatedCount?: number;
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

export interface HandrailQuickBooksItem extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "Item";
  readonly name: string;
  readonly fullyQualifiedName?: string;
  readonly displayName: string;
  readonly itemType?: string;
  readonly status?: "active" | "inactive";
  readonly active?: boolean;
  readonly sku?: string;
  readonly description?: string;
  readonly taxable?: boolean;
  readonly unitPrice?: number;
  readonly purchaseCost?: number;
  readonly quantityOnHand?: number;
  readonly parentRef?: HandrailQuickBooksAccountingReference;
  readonly parentItemId?: string;
  readonly parentItemName?: string;
  readonly hierarchyPath?: readonly string[];
  readonly hierarchyLevel?: number;
  readonly incomeAccountRef?: HandrailQuickBooksAccountingReference;
  readonly expenseAccountRef?: HandrailQuickBooksAccountingReference;
  readonly assetAccountRef?: HandrailQuickBooksAccountingReference;
}

export interface HandrailQuickBooksClass extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "Class";
  readonly name: string;
  readonly fullyQualifiedName?: string;
  readonly displayName: string;
  readonly status?: "active" | "inactive";
  readonly active?: boolean;
  readonly subClass?: boolean;
  readonly parentRef?: HandrailQuickBooksAccountingReference;
  readonly parentClassId?: string;
  readonly parentClassName?: string;
  readonly hierarchyPath?: readonly string[];
  readonly hierarchyLevel?: number;
}

export interface HandrailQuickBooksLocation extends HandrailQuickBooksProviderMetadata {
  readonly id: string;
  readonly sourceObject: "Department";
  readonly name: string;
  readonly fullyQualifiedName?: string;
  readonly displayName: string;
  readonly locationSource: "department";
  readonly locationObjectStatus: "mapped_to_department";
  readonly unsupportedProviderObject?: "Location";
  readonly status?: "active" | "inactive";
  readonly active?: boolean;
  readonly subLocation?: boolean;
  readonly parentRef?: HandrailQuickBooksAccountingReference;
  readonly parentLocationId?: string;
  readonly parentLocationName?: string;
  readonly hierarchyPath?: readonly string[];
  readonly hierarchyLevel?: number;
}

export type HandrailQuickBooksTransactionSourceObject = Exclude<
  HandrailQuickBooksRawImportObjectType,
  "Account" | "Class" | "Customer" | "Department" | "Item" | "JournalEntry" | "Vendor"
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
  readonly item?: HandrailQuickBooksAccountingReference;
  readonly classRef?: HandrailQuickBooksAccountingReference;
  readonly department?: HandrailQuickBooksAccountingReference;
}

export interface HandrailQuickBooksLedgerSearchRequest extends HandrailQuickBooksListRequest {
  readonly accountId?: string;
  readonly from?: string;
  readonly partyId?: string;
  readonly query?: string;
  readonly to?: string;
  readonly transactionId?: string;
}

export type HandrailQuickBooksAccountListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksAccount>;

export type HandrailQuickBooksItemListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksItem>;

export type HandrailQuickBooksClassListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksClass>;

export type HandrailQuickBooksLocationListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksLocation>;

export type HandrailQuickBooksPartyListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksParty>;

export type HandrailQuickBooksTransactionListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksTransaction>;

export type HandrailQuickBooksLedgerEntryListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>;

export type HandrailQuickBooksSyncJobListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksSyncJobSummary>;

export type HandrailQuickBooksImportBatchListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksImportBatchSummary>;

export type HandrailQuickBooksSyncCheckpointListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksSyncCheckpoint>;

export type HandrailQuickBooksRawImportStatusListResponse =
  HandrailQuickBooksListResponse<HandrailQuickBooksRawImportStatus>;

export type HandrailQuickBooksNormalizedResource =
  | HandrailQuickBooksAccount
  | HandrailQuickBooksClass
  | HandrailQuickBooksItem
  | HandrailQuickBooksLedgerEntry
  | HandrailQuickBooksLocation
  | HandrailQuickBooksParty
  | HandrailQuickBooksTransaction;

export interface HandrailQuickBooksNormalizedResourceMap {
  readonly accounts?: readonly HandrailQuickBooksAccount[];
  readonly classes?: readonly HandrailQuickBooksClass[];
  readonly items?: readonly HandrailQuickBooksItem[];
  readonly ledger_entries?: readonly HandrailQuickBooksLedgerEntry[];
  readonly locations?: readonly HandrailQuickBooksLocation[];
  readonly parties?: readonly HandrailQuickBooksParty[];
  readonly transactions?: readonly HandrailQuickBooksTransaction[];
}
