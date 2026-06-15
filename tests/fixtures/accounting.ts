import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksConnectUrlRequest,
  HandrailQuickBooksConnectUrlResponse,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksLedgerSearchRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksParty,
  HandrailQuickBooksReconciliationRequest,
  HandrailQuickBooksReconciliationResult,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTransaction,
  HandrailQuickBooksTrialBalanceReport,
  HandrailQuickBooksTrialBalanceRequest
} from "../../src/index.js";

export const contractTenantId = "tenant_contract_123";
export const contractBaseUrl = "https://quickbooks.example.test";
export const contractApiKey = "test-api-key";

export const accountingFixtures = {
  accounts: [
    {
      accountNumber: "1000",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_account_100",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/accounts/qbo_account_100",
        syncToken: "7"
      },
      currencyCode: "USD",
      id: "acct_cash_operating",
      isActive: true,
      name: "Operating Cash",
      subtype: "checking",
      type: "asset"
    },
    {
      accountNumber: "2000",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_account_200",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/accounts/qbo_account_200",
        syncToken: "3"
      },
      currencyCode: "USD",
      id: "acct_accounts_payable",
      isActive: true,
      name: "Accounts Payable",
      subtype: "accounts_payable",
      type: "liability"
    },
    {
      accountNumber: "4000",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_account_400",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/accounts/qbo_account_400",
        syncToken: "5"
      },
      currencyCode: "USD",
      id: "acct_service_revenue",
      isActive: true,
      name: "Service Revenue",
      subtype: "service_fee_income",
      type: "income"
    }
  ] satisfies readonly HandrailQuickBooksAccount[],
  ledgerEntries: [
    {
      accountId: "acct_cash_operating",
      amount: "1250.00",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_journal_entry_900:line_1",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/journal-entries/qbo_journal_entry_900",
        syncToken: "1"
      },
      currencyCode: "USD",
      description: "Customer payment deposit",
      id: "ledger_entry_001",
      partyId: "party_customer_acme",
      postedAt: "2026-05-15",
      transactionId: "txn_payment_001"
    },
    {
      accountId: "acct_service_revenue",
      amount: "-1250.00",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_journal_entry_900:line_2",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/journal-entries/qbo_journal_entry_900",
        syncToken: "1"
      },
      currencyCode: "USD",
      description: "Customer payment revenue recognition",
      id: "ledger_entry_002",
      partyId: "party_customer_acme",
      postedAt: "2026-05-15",
      transactionId: "txn_payment_001"
    }
  ] satisfies readonly HandrailQuickBooksLedgerEntry[],
  parties: [
    {
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_customer_300",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/customers/qbo_customer_300",
        syncToken: "4"
      },
      displayName: "Acme Customer",
      email: "accounting@example.test",
      id: "party_customer_acme",
      isActive: true,
      type: "customer"
    }
  ] satisfies readonly HandrailQuickBooksParty[],
  transactions: [
    {
      amount: "1250.00",
      audit: {
        importBatchId: "batch_contract_2026_05",
        qboObjectId: "qbo_payment_700",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/payments/qbo_payment_700",
        syncToken: "2"
      },
      currencyCode: "USD",
      date: "2026-05-15",
      id: "txn_payment_001",
      memo: "May service payment",
      partyId: "party_customer_acme",
      status: "posted",
      type: "payment"
    }
  ] satisfies readonly HandrailQuickBooksTransaction[]
};

export const contractRequests = {
  connectUrl: {
    returnUrl: "https://erp.example.test/settings/accounting",
    state: "state_contract_123"
  } satisfies HandrailQuickBooksConnectUrlRequest,
  ledgerSearch: {
    accountId: "acct_cash_operating",
    from: "2026-05-01",
    query: "deposit",
    to: "2026-05-31"
  } satisfies HandrailQuickBooksLedgerSearchRequest,
  reconciliation: {
    accountId: "acct_cash_operating",
    endingBalance: "1250.00",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    }
  } satisfies HandrailQuickBooksReconciliationRequest,
  startSync: {
    entities: ["accounts", "ledger_entries"],
    importBatchId: "batch_contract_2026_05",
    mode: "incremental",
    since: "2026-05-01T00:00:00.000Z"
  } satisfies HandrailQuickBooksStartSyncRequest,
  trialBalance: {
    accountingBasis: "accrual",
    asOfDate: "2026-05-31",
    currencyCode: "USD"
  } satisfies HandrailQuickBooksTrialBalanceRequest
};

export const contractResponses = {
  accounts: {
    data: accountingFixtures.accounts,
    page: {
      cursor: "cursor_accounts_next",
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksAccount>,
  connectUrl: {
    connectUrl: "https://quickbooks.example.test/oauth/connect/session_contract_123",
    expiresAt: "2026-06-15T20:00:00.000Z",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksConnectUrlResponse,
  connectionStatus: {
    connection: {
      audit: {
        importBatchId: "batch_contract_2026_05",
        realmId: "realm_demo_12345",
        sourcePayloadRef: "raw://batch_contract_2026_05/connection"
      },
      connectedAt: "2026-05-01T12:00:00.000Z",
      connectionId: "qbo_connection_contract",
      lastSyncedAt: "2026-05-31T18:30:00.000Z",
      status: "connected",
      tenantId: contractTenantId
    },
    providerEnvironment: "sandbox",
    providerProfile: {
      environment: "sandbox",
      name: "active",
      status: "configured"
    },
    status: "connected",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksConnectionStatusResponse,
  ledgerSearch: {
    data: accountingFixtures.ledgerEntries,
    page: {
      hasMore: false,
      limit: 50
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>,
  reconciliation: {
    accountId: "acct_cash_operating",
    audit: {
      importBatchId: "batch_contract_2026_05",
      qboObjectId: "qbo_account_100",
      realmId: "realm_demo_12345",
      sourcePayloadRef: "raw://batch_contract_2026_05/reconciliations/recon_contract_123"
    },
    difference: "0.00",
    reconciliationId: "recon_contract_123",
    status: "balanced"
  } satisfies HandrailQuickBooksReconciliationResult,
  syncJob: {
    audit: {
      importBatchId: "batch_contract_2026_05",
      realmId: "realm_demo_12345",
      sourcePayloadRef: "raw://batch_contract_2026_05/sync-jobs/sync_contract_123"
    },
    entity: "ledger_entries",
    jobId: "sync_contract_123",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "queued"
  } satisfies HandrailQuickBooksSyncJobSummary,
  trialBalance: {
    audit: {
      importBatchId: "batch_contract_2026_05",
      realmId: "realm_demo_12345",
      sourcePayloadRef: "raw://batch_contract_2026_05/reports/trial-balance/2026-05-31"
    },
    generatedAt: "2026-06-15T19:31:00.000Z",
    lines: [
      {
        accountId: "acct_cash_operating",
        accountName: "Operating Cash",
        credit: "0.00",
        debit: "1250.00"
      },
      {
        accountId: "acct_service_revenue",
        accountName: "Service Revenue",
        credit: "1250.00",
        debit: "0.00"
      }
    ],
    name: "trial_balance",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    },
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksTrialBalanceReport
};
