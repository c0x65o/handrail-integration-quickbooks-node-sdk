import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksAccountsPayableAgingReport,
  HandrailQuickBooksAccountsReceivableAgingReport,
  HandrailQuickBooksAgingReportRequest,
  HandrailQuickBooksBalanceSheetReport,
  HandrailQuickBooksBalanceSheetRequest,
  HandrailQuickBooksCashFlowReport,
  HandrailQuickBooksCashFlowRequest,
  HandrailQuickBooksClass,
  HandrailQuickBooksConnectUrlRequest,
  HandrailQuickBooksConnectUrlResponse,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksDrilldownRequest,
  HandrailQuickBooksDrilldownResult,
  HandrailQuickBooksGeneralLedgerReport,
  HandrailQuickBooksGeneralLedgerRequest,
  HandrailQuickBooksHealthResponse,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksImportVolumeSummary,
  HandrailQuickBooksItem,
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksLedgerSearchRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksLocation,
  HandrailQuickBooksParty,
  HandrailQuickBooksProfitAndLossReport,
  HandrailQuickBooksProfitAndLossRequest,
  HandrailQuickBooksRawImportStatus,
  HandrailQuickBooksReconciliationRequest,
  HandrailQuickBooksReconciliationResult,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncCheckpoint,
  HandrailQuickBooksSyncCheckpointMetadata,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksTokenStatusResponse,
  HandrailQuickBooksTransaction,
  HandrailQuickBooksTrialBalanceReport,
  HandrailQuickBooksTrialBalanceRequest
} from "../../src/index.js";

export const contractTenantId = "tenant_contract_123";
export const contractBaseUrl = "https://quickbooks.example.test";
export const contractApiKey = "test-api-key";
export const contractImportBatchId = "batch_contract_2026_05";
export const contractJobId = "sync_contract_123";
export const contractCheckpointId = "quickbooks_incremental_accounts_Account";
const contractCheckpointRef = `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`;
const contractInitialLoadCheckpointId = "quickbooks_full_initial_load_accounts_Account";
const contractInitialLoadCheckpointRef =
  `checkpoint://quickbooks/${contractTenantId}/${contractInitialLoadCheckpointId}`;

function reportSnapshotMetadata(reportName: string, dateKey: string) {
  const reportSnapshotId =
    `quickbooks_${reportName}_${contractTenantId}_${dateKey}_${contractImportBatchId}`;

  return {
    checkpointRefs: [contractCheckpointRef],
    importBatchId: contractImportBatchId,
    jobId: contractJobId,
    realmId: "realm_demo_12345",
    reportSnapshotId,
    reportSnapshotRef: `report-snapshot://quickbooks/${contractTenantId}/${reportSnapshotId}`,
    sourceRefs: [
      `raw://${contractImportBatchId}/reports/${reportName.replaceAll("_", "-")}/${dateKey}`
    ]
  } as const;
}

const providerMetadata = {
  tenantId: contractTenantId,
  realmId: "realm_demo_12345",
  companyId: "realm_demo_12345",
  provider: "intuit",
  providerEnvironment: "sandbox",
  source: "quickbooks_accounting_api",
  importBatchId: contractImportBatchId,
  jobId: contractJobId,
  importedAt: "2026-06-15T19:45:00.000Z",
  syncedAt: "2026-06-15T19:45:00.000Z"
} as const;

export const accountingFixtures = {
  accounts: [
    {
      ...providerMetadata,
      accountSubType: "Checking",
      accountType: "Bank",
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      classification: "Asset",
      currency: {
        name: "United States Dollar",
        value: "USD"
      },
      currentBalance: 1250,
      currentBalanceWithSubAccounts: 1250,
      fullyQualifiedName: "Operating Cash",
      hierarchyLevel: 0,
      hierarchyPath: ["Operating Cash"],
      id: "accounting_account_100",
      name: "Operating Cash",
      sourceObject: "Account",
      sourceObjectId: "100",
      sourceUpdatedAt: "2026-06-15T19:20:00.000Z",
      subAccount: false
    },
    {
      ...providerMetadata,
      accountSubType: "AccountsPayable",
      accountType: "Accounts Payable",
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      classification: "Liability",
      currency: {
        value: "USD"
      },
      currentBalance: 0,
      currentBalanceWithSubAccounts: 0,
      fullyQualifiedName: "Accounts Payable",
      hierarchyLevel: 0,
      hierarchyPath: ["Accounts Payable"],
      id: "accounting_account_200",
      name: "Accounts Payable",
      sourceObject: "Account",
      sourceObjectId: "200",
      sourceUpdatedAt: "2026-06-15T19:21:00.000Z",
      subAccount: false
    },
    {
      ...providerMetadata,
      accountSubType: "ServiceFeeIncome",
      accountType: "Income",
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      classification: "Revenue",
      currency: {
        value: "USD"
      },
      id: "accounting_account_400",
      name: "Service Revenue",
      sourceObject: "Account",
      sourceObjectId: "400",
      sourceUpdatedAt: "2026-06-15T19:22:00.000Z"
    }
  ] satisfies readonly HandrailQuickBooksAccount[],
  ledgerEntries: [
    {
      ...providerMetadata,
      account: {
        name: "Operating Cash",
        value: "100"
      },
      amount: 1250,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      currency: {
        value: "USD"
      },
      description: "Customer payment deposit",
      documentNumber: "PMT-700",
      id: "accounting_ledger_entry_payment_700_1",
      lineId: "1",
      party: {
        name: "Acme Customer",
        value: "300"
      },
      item: {
        name: "Consulting Services",
        value: "700"
      },
      classRef: {
        name: "Operations",
        value: "810"
      },
      department: {
        name: "Main Office",
        value: "910"
      },
      postedAt: "2026-05-15",
      postingType: "Debit",
      sourceObject: "Payment",
      sourceObjectId: "700:1",
      sourceUpdatedAt: "2026-06-15T19:25:00.000Z",
      transactionDate: "2026-05-15",
      transactionId: "700",
      transactionType: "payment"
    },
    {
      ...providerMetadata,
      account: {
        name: "Service Revenue",
        value: "400"
      },
      amount: -1250,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      currency: {
        value: "USD"
      },
      description: "Customer payment revenue recognition",
      documentNumber: "PMT-700",
      id: "accounting_ledger_entry_payment_700_2",
      lineId: "2",
      party: {
        name: "Acme Customer",
        value: "300"
      },
      postedAt: "2026-05-15",
      postingType: "Credit",
      sourceObject: "Payment",
      sourceObjectId: "700:2",
      sourceUpdatedAt: "2026-06-15T19:25:00.000Z",
      transactionDate: "2026-05-15",
      transactionId: "700",
      transactionType: "payment"
    },
    {
      ...providerMetadata,
      account: {
        name: "Software Expense",
        value: "610"
      },
      amount: 150,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      currency: {
        value: "USD"
      },
      description: "Sandbox vendor services",
      documentNumber: "BILL-920",
      id: "accounting_ledger_entry_bill_920_1",
      lineId: "1",
      party: {
        name: "Acme Customer",
        value: "300"
      },
      postedAt: "2026-05-17",
      sourceObject: "Bill",
      sourceObjectId: "920:1",
      sourceUpdatedAt: "2026-06-15T19:25:15.000Z",
      transactionDate: "2026-05-17",
      transactionId: "920",
      transactionType: "bill"
    },
    {
      ...providerMetadata,
      account: {
        name: "Software Expense",
        value: "610"
      },
      amount: 500,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      classRef: {
        name: "Operations",
        value: "810"
      },
      currency: {
        value: "USD"
      },
      department: {
        name: "Main Office",
        value: "910"
      },
      description: "Sandbox bank deposit",
      documentNumber: "DEP-940",
      id: "accounting_ledger_entry_deposit_940_1",
      lineId: "1",
      party: {
        name: "Acme Customer",
        value: "300"
      },
      postedAt: "2026-05-19",
      sourceObject: "Deposit",
      sourceObjectId: "940:1",
      sourceUpdatedAt: "2026-06-15T19:25:45.000Z",
      transactionDate: "2026-05-19",
      transactionId: "940",
      transactionType: "deposit"
    }
  ] satisfies readonly HandrailQuickBooksLedgerEntry[],
  parties: [
    {
      ...providerMetadata,
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      companyName: "Acme Customer LLC",
      displayName: "Acme Customer",
      email: "accounting@example.test",
      id: "accounting_party_customer_300",
      partyType: "customer",
      sourceObject: "Customer",
      sourceObjectId: "300",
      sourceUpdatedAt: "2026-06-15T19:23:00.000Z"
    },
    {
      ...providerMetadata,
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      companyName: "Demo Vendor LLC",
      displayName: "Demo Vendor",
      email: "billing@example.test",
      id: "accounting_party_vendor_500",
      partyType: "vendor",
      sourceObject: "Vendor",
      sourceObjectId: "500",
      sourceUpdatedAt: "2026-06-15T19:24:00.000Z"
    }
  ] satisfies readonly HandrailQuickBooksParty[],
  items: [
    {
      ...providerMetadata,
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      displayName: "Services:Consulting Services",
      fullyQualifiedName: "Services:Consulting Services",
      hierarchyLevel: 1,
      hierarchyPath: ["Services", "Consulting Services"],
      id: "accounting_item_700",
      incomeAccountRef: {
        name: "Service Revenue",
        value: "400"
      },
      itemType: "Service",
      name: "Consulting Services",
      parentItemId: "701",
      parentItemName: "Services",
      parentRef: {
        name: "Services",
        value: "701"
      },
      sku: "CONSULT",
      sourceObject: "Item",
      sourceObjectId: "700",
      sourceUpdatedAt: "2026-06-15T19:24:30.000Z",
      status: "active",
      taxable: false,
      unitPrice: 125
    }
  ] satisfies readonly HandrailQuickBooksItem[],
  classes: [
    {
      ...providerMetadata,
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      displayName: "Operations",
      fullyQualifiedName: "Operations",
      hierarchyLevel: 0,
      hierarchyPath: ["Operations"],
      id: "accounting_class_810",
      name: "Operations",
      sourceObject: "Class",
      sourceObjectId: "810",
      sourceUpdatedAt: "2026-06-15T19:24:40.000Z",
      status: "active",
      subClass: false
    }
  ] satisfies readonly HandrailQuickBooksClass[],
  locations: [
    {
      ...providerMetadata,
      active: true,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      displayName: "Main Office",
      fullyQualifiedName: "Main Office",
      hierarchyLevel: 0,
      hierarchyPath: ["Main Office"],
      id: "accounting_location_department_910",
      locationObjectStatus: "mapped_to_department",
      locationSource: "department",
      name: "Main Office",
      sourceObject: "Department",
      sourceObjectId: "910",
      sourceUpdatedAt: "2026-06-15T19:24:50.000Z",
      status: "active",
      subLocation: false,
      unsupportedProviderObject: "Location"
    }
  ] satisfies readonly HandrailQuickBooksLocation[],
  transactions: [
    {
      ...providerMetadata,
      amount: 1250,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      currency: {
        value: "USD"
      },
      documentNumber: "PMT-700",
      id: "accounting_transaction_payment_700",
      party: {
        name: "Acme Customer",
        value: "300"
      },
      privateNote: "May service payment",
      sourceObject: "Payment",
      sourceObjectId: "700",
      sourceUpdatedAt: "2026-06-15T19:25:00.000Z",
      transactionDate: "2026-05-15",
      transactionType: "payment"
    },
    {
      ...providerMetadata,
      amount: 150,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      balance: 150,
      currency: {
        value: "USD"
      },
      documentNumber: "BILL-920",
      id: "accounting_transaction_bill_920",
      party: {
        name: "Demo Vendor",
        value: "500"
      },
      sourceObject: "Bill",
      sourceObjectId: "920",
      sourceUpdatedAt: "2026-06-15T19:25:15.000Z",
      transactionDate: "2026-05-17",
      transactionType: "bill"
    },
    {
      ...providerMetadata,
      amount: 500,
      audit: {
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}`
      },
      currency: {
        value: "USD"
      },
      documentNumber: "DEP-940",
      id: "accounting_transaction_deposit_940",
      party: {
        name: "Operating Cash",
        value: "100"
      },
      sourceObject: "Deposit",
      sourceObjectId: "940",
      sourceUpdatedAt: "2026-06-15T19:25:45.000Z",
      transactionDate: "2026-05-19",
      transactionType: "deposit"
    }
  ] satisfies readonly HandrailQuickBooksTransaction[]
};

export const contractRequests = {
  connectUrl: {
    returnUrl: "https://erp.example.test/settings/accounting",
    state: "state_contract_123"
  } satisfies HandrailQuickBooksConnectUrlRequest,
  aging: {
    accountingBasis: "accrual",
    asOfDate: "2026-05-31",
    bucketDays: [30, 60, 90],
    currencyCode: "USD"
  } satisfies HandrailQuickBooksAgingReportRequest,
  balanceSheet: {
    accountingBasis: "accrual",
    asOfDate: "2026-05-31",
    currencyCode: "USD"
  } satisfies HandrailQuickBooksBalanceSheetRequest,
  cashFlow: {
    accountingBasis: "accrual",
    currencyCode: "USD",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    }
  } satisfies HandrailQuickBooksCashFlowRequest,
  drilldown: {
    id: "report-line-profit-and-loss-income",
    type: "report_line"
  } satisfies HandrailQuickBooksDrilldownRequest,
  generalLedger: {
    accountingBasis: "accrual",
    accountId: "accounting_account_100",
    currencyCode: "USD",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    }
  } satisfies HandrailQuickBooksGeneralLedgerRequest,
  ledgerSearch: {
    accountId: "100",
    from: "2026-05-01",
    query: "deposit",
    to: "2026-05-31"
  } satisfies HandrailQuickBooksLedgerSearchRequest,
  profitAndLoss: {
    accountingBasis: "accrual",
    currencyCode: "USD",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    }
  } satisfies HandrailQuickBooksProfitAndLossRequest,
  reconciliation: {
    accountId: "accounting_account_100",
    endingBalance: "1250.00",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    }
  } satisfies HandrailQuickBooksReconciliationRequest,
  startSync: {
    entities: ["accounts", "ledger_entries"],
    importBatchId: contractImportBatchId,
    mode: "incremental",
    since: "2026-05-01T00:00:00.000Z"
  } satisfies HandrailQuickBooksStartSyncRequest,
  trialBalance: {
    accountingBasis: "accrual",
    asOfDate: "2026-05-31",
    currencyCode: "USD"
  } satisfies HandrailQuickBooksTrialBalanceRequest
};

const deltaCounts = {
  skippedCount: 2,
  changedCount: 1,
  insertedCount: 3,
  failedCount: 0
} as const;

const initialLoadDeltaCounts = {
  skippedCount: 0,
  changedCount: 0,
  insertedCount: 8,
  failedCount: 0
} as const;

const incrementalImportVolume = {
  entityCounts: {
    accounts: 3
  },
  errorCount: 0,
  objectCount: 3,
  objectCounts: {
    Account: 3
  },
  totalObjectCount: 3,
  warningCount: 0
} satisfies HandrailQuickBooksImportVolumeSummary;

const initialLoadImportVolume = {
  entityCounts: {
    accounts: 3,
    parties: 2,
    transactions: 3
  },
  errorCount: 0,
  objectCount: 8,
  objectCounts: {
    Account: 3,
    Customer: 1,
    Vendor: 1,
    Bill: 1,
    Payment: 1,
    Purchase: 0,
    Deposit: 1,
    Transfer: 0,
    SalesReceipt: 0,
    CreditMemo: 0,
    RefundReceipt: 0,
    BillPayment: 0,
    VendorCredit: 0
  },
  totalObjectCount: 8,
  warningCount: 0
} satisfies HandrailQuickBooksImportVolumeSummary;

const incrementalCheckpointMetadata = {
  audit: {
    checkpointId: contractCheckpointId,
    importBatchId: contractImportBatchId,
    realmId: "realm_demo_12345",
    sourcePayloadRefs: [
      `raw://${contractImportBatchId}`,
      `raw://${contractImportBatchId}/sync-jobs/${contractJobId}`
    ]
  },
  checkpointId: contractCheckpointId,
  checkpointKind: "provider_updated_at_watermark",
  checkpointRef: contractCheckpointRef,
  completedAt: "2026-06-15T19:45:00.000Z",
  cursorRefs: [
    `raw://${contractImportBatchId}`,
    `raw://${contractImportBatchId}/objects/Account/sync-jobs/${contractJobId}`
  ],
  entity: "accounts",
  importBatchId: contractImportBatchId,
  jobIds: [contractJobId],
  objectType: "Account",
  providerUpdatedAtWatermark: "2026-06-15T19:25:00.000Z",
  startedAt: "2026-06-15T19:30:00.000Z",
  status: "succeeded",
  syncJobRefs: [`raw://${contractImportBatchId}/sync-jobs/${contractJobId}`],
  syncMode: "incremental"
} satisfies HandrailQuickBooksSyncCheckpointMetadata;

const initialLoadCheckpointMetadata = {
  audit: {
    checkpointId: contractInitialLoadCheckpointId,
    importBatchId: contractImportBatchId,
    realmId: "realm_demo_12345",
    sourcePayloadRefs: [
      `raw://${contractImportBatchId}`,
      `raw://${contractImportBatchId}/objects/Account`
    ]
  },
  checkpointId: contractInitialLoadCheckpointId,
  checkpointKind: "provider_updated_at_watermark",
  checkpointRef: contractInitialLoadCheckpointRef,
  completedAt: "2026-06-15T19:45:00.000Z",
  cursorRefs: [
    `raw://${contractImportBatchId}`,
    `raw://${contractImportBatchId}/objects/Account`,
    `raw://${contractImportBatchId}/objects/Customer`,
    `raw://${contractImportBatchId}/objects/Vendor`,
    `raw://${contractImportBatchId}/objects/Bill`,
    `raw://${contractImportBatchId}/objects/Deposit`,
    `raw://${contractImportBatchId}/objects/Payment`
  ],
  entity: "accounts",
  importBatchId: contractImportBatchId,
  jobIds: [contractJobId],
  objectType: "Account",
  providerUpdatedAtWatermark: "2026-06-15T19:25:00.000Z",
  startedAt: "2026-06-15T19:30:00.000Z",
  status: "succeeded",
  syncJobRefs: [`raw://${contractImportBatchId}/sync-jobs/${contractJobId}`],
  syncMode: "full"
} satisfies HandrailQuickBooksSyncCheckpointMetadata;

export const contractResponses = {
  accounts: {
    data: accountingFixtures.accounts,
    page: {
      cursor: "cursor_accounts_next",
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksAccount>,
  classes: {
    data: accountingFixtures.classes,
    page: {
      cursor: "cursor_classes_next",
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksClass>,
  checkpoint: {
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}`,
        `raw://${contractImportBatchId}/sync-jobs/${contractJobId}`
      ]
    },
    checkpointId: contractCheckpointId,
    checkpointKind: "provider_updated_at_watermark",
    companyId: "realm_demo_12345",
    completedAt: "2026-06-15T19:45:00.000Z",
    cursorRefs: [
      `raw://${contractImportBatchId}`,
      `raw://${contractImportBatchId}/objects/Account/sync-jobs/${contractJobId}`
    ],
    deltaCounts,
    entity: "accounts",
    importBatchId: contractImportBatchId,
    jobIds: [contractJobId],
    objectType: "Account",
    providerUpdatedAtWatermark: "2026-06-15T19:25:00.000Z",
    realmId: "realm_demo_12345",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "succeeded",
    syncJobRefs: [`raw://${contractImportBatchId}/sync-jobs/${contractJobId}`],
    syncMode: "incremental",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksSyncCheckpoint,
  checkpoints: {
    data: [] as HandrailQuickBooksSyncCheckpoint[],
    page: {
      hasMore: false,
      limit: 2
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksSyncCheckpoint>,
  connectUrl: {
    connectUrl: "https://quickbooks.example.test/oauth/connect/session_contract_123",
    expiresAt: "2026-06-15T20:00:00.000Z",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksConnectUrlResponse,
  connectionStatus: {
    connection: {
      audit: {
        importBatchId: contractImportBatchId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}/connection`
      },
      connectedAt: "2026-05-01T12:00:00.000Z",
      connectionId: "qbo_connection_contract",
      lastSyncedAt: "2026-05-31T18:30:00.000Z",
      status: "connected",
      tenantId: contractTenantId
    },
    providerEnvironment: "sandbox",
    providerMode: "sandbox",
    providerProfile: {
      environment: "sandbox",
      name: "active",
      status: "configured"
    },
    status: "connected",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksConnectionStatusResponse,
  accountsPayableAging: {
    ...reportSnapshotMetadata("accounts_payable_aging", "2026-05-31"),
    asOfDate: "2026-05-31",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/accounts-payable-aging/2026-05-31`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:35:00.000Z",
    name: "accounts_payable_aging",
    rows: [
      {
        current: "150.00",
        days1To30: "0.00",
        days31To60: "0.00",
        days61To90: "0.00",
        drilldown: {
          drilldownId: "drilldown-ap-aging-demo-vendor",
          type: "report_line"
        },
        over90: "0.00",
        partyId: "accounting_party_vendor_500",
        partyName: "Demo Vendor",
        total: "150.00"
      }
    ],
    tenantId: contractTenantId,
    totals: {
      current: "150.00",
      days1To30: "0.00",
      days31To60: "0.00",
      days61To90: "0.00",
      drilldown: {
        drilldownId: "drilldown-ap-aging-total",
        type: "report_total"
      },
      over90: "0.00",
      total: "150.00"
    }
  } satisfies HandrailQuickBooksAccountsPayableAgingReport,
  accountsReceivableAging: {
    ...reportSnapshotMetadata("accounts_receivable_aging", "2026-05-31"),
    asOfDate: "2026-05-31",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/accounts-receivable-aging/2026-05-31`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:34:00.000Z",
    name: "accounts_receivable_aging",
    rows: [
      {
        current: "1250.00",
        days1To30: "0.00",
        days31To60: "0.00",
        days61To90: "0.00",
        drilldown: {
          drilldownId: "drilldown-ar-aging-acme-customer",
          type: "report_line"
        },
        over90: "0.00",
        partyId: "accounting_party_customer_300",
        partyName: "Acme Customer",
        total: "1250.00"
      }
    ],
    tenantId: contractTenantId,
    totals: {
      current: "1250.00",
      days1To30: "0.00",
      days31To60: "0.00",
      days61To90: "0.00",
      drilldown: {
        drilldownId: "drilldown-ar-aging-total",
        type: "report_total"
      },
      over90: "0.00",
      total: "1250.00"
    }
  } satisfies HandrailQuickBooksAccountsReceivableAgingReport,
  balanceSheet: {
    ...reportSnapshotMetadata("balance_sheet", "2026-05-31"),
    accountingBasis: "accrual",
    asOfDate: "2026-05-31",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/balance-sheet/2026-05-31`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:32:00.000Z",
    lines: [
      {
        amount: "1250.00",
        drilldown: {
          drilldownId: "drilldown-balance-sheet-assets",
          type: "report_line"
        },
        id: "report-line-balance-sheet-assets",
        label: "Total Assets",
        lineType: "total",
        section: "assets"
      },
      {
        amount: "0.00",
        drilldown: {
          drilldownId: "drilldown-balance-sheet-liabilities",
          type: "report_line"
        },
        id: "report-line-balance-sheet-liabilities",
        label: "Total Liabilities",
        lineType: "total",
        section: "liabilities"
      },
      {
        amount: "1250.00",
        drilldown: {
          drilldownId: "drilldown-balance-sheet-equity",
          type: "report_line"
        },
        id: "report-line-balance-sheet-equity",
        label: "Total Equity",
        lineType: "total",
        section: "equity"
      }
    ],
    name: "balance_sheet",
    tenantId: contractTenantId,
    totals: {
      totalAssets: {
        amount: "1250.00",
        label: "Total Assets"
      },
      totalEquity: {
        amount: "1250.00",
        label: "Total Equity"
      },
      totalLiabilities: {
        amount: "0.00",
        label: "Total Liabilities"
      },
      totalLiabilitiesAndEquity: {
        amount: "1250.00",
        label: "Total Liabilities and Equity"
      }
    }
  } satisfies HandrailQuickBooksBalanceSheetReport,
  cashFlow: {
    ...reportSnapshotMetadata("cash_flow", "2026-05-01_2026-05-31"),
    accountingBasis: "accrual",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/cash-flow/2026-05`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:33:00.000Z",
    lines: [
      {
        amount: "1250.00",
        drilldown: {
          drilldownId: "drilldown-cash-flow-operating",
          type: "report_line"
        },
        id: "report-line-cash-flow-operating",
        label: "Net Cash from Operating Activities",
        lineType: "total",
        section: "operating"
      }
    ],
    name: "cash_flow",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    },
    tenantId: contractTenantId,
    totals: {
      cashAtBeginningOfPeriod: {
        amount: "0.00",
        label: "Cash at Beginning of Period"
      },
      cashAtEndOfPeriod: {
        amount: "1250.00",
        label: "Cash at End of Period"
      },
      netCashChange: {
        amount: "1250.00",
        drilldown: {
          drilldownId: "drilldown-cash-flow-net-change",
          type: "report_total"
        },
        label: "Net Cash Change"
      }
    }
  } satisfies HandrailQuickBooksCashFlowReport,
  drilldown: {
    ...reportSnapshotMetadata("profit_and_loss", "latest_latest"),
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/profit-and-loss/2026-05`,
        `raw://${contractImportBatchId}/sync-jobs/${contractJobId}`
      ]
    },
    generatedAt: "2026-06-15T19:36:00.000Z",
    id: "report-line-profit-and-loss-income",
    relatedAccounts: [accountingFixtures.accounts[2]],
    relatedAuditReferences: [
      {
        checkpointId: contractCheckpointId,
        importBatchId: contractImportBatchId,
        jobId: contractJobId,
        realmId: "realm_demo_12345",
        sourcePayloadRef: `raw://${contractImportBatchId}/reports/profit-and-loss/2026-05`
      }
    ],
    relatedLedgerEntries: [accountingFixtures.ledgerEntries[1]],
    relatedParties: [accountingFixtures.parties[0]],
    relatedReportLines: [
      {
        accountId: "accounting_account_400",
        accountName: "Service Revenue",
        amount: "1250.00",
        drilldown: {
          drilldownId: "report-line-profit-and-loss-income",
          type: "report_line"
        },
        id: "report-line-profit-and-loss-income",
        label: "Service Revenue",
        lineType: "detail",
        section: "income"
      }
    ],
    relatedTransactions: [accountingFixtures.transactions[0]],
    reportName: "profit_and_loss",
    tenantId: contractTenantId,
    type: "report_line"
  } satisfies HandrailQuickBooksDrilldownResult,
  generalLedger: {
    ...reportSnapshotMetadata("general_ledger", "2026-05-01_2026-05-31"),
    accountingBasis: "accrual",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/general-ledger/2026-05`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    closingBalance: "1250.00",
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:33:30.000Z",
    name: "general_ledger",
    openingBalance: "0.00",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    },
    rows: [
      {
        accountId: "accounting_account_100",
        accountName: "Operating Cash",
        amount: "1250.00",
        audit: {
          importBatchId: contractImportBatchId,
          jobId: contractJobId,
          realmId: "realm_demo_12345",
          sourcePayloadRef: `raw://${contractImportBatchId}`
        },
        balance: "1250.00",
        currencyCode: "USD",
        debit: "1250.00",
        description: "Customer payment deposit",
        documentNumber: "PMT-700",
        drilldown: {
          drilldownId: "drilldown-ledger-entry-payment-700-1",
          type: "ledger_entry"
        },
        ledgerEntryId: "accounting_ledger_entry_payment_700_1",
        partyId: "accounting_party_customer_300",
        partyName: "Acme Customer",
        transactionDate: "2026-05-15",
        transactionId: "700",
        transactionType: "payment"
      }
    ],
    tenantId: contractTenantId,
    totals: {
      credits: {
        amount: "0.00",
        label: "Credits"
      },
      debits: {
        amount: "1250.00",
        label: "Debits"
      },
      netChange: {
        amount: "1250.00",
        drilldown: {
          drilldownId: "drilldown-general-ledger-net-change",
          type: "report_total"
        },
        label: "Net Change"
      }
    }
  } satisfies HandrailQuickBooksGeneralLedgerReport,
  health: {
    ok: true,
    service: "handrail-integration-quickbooks"
  } satisfies HandrailQuickBooksHealthResponse,
  importBatch: {
    audit: {
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/objects/Account/sync-jobs/${contractJobId}`,
        `raw://${contractImportBatchId}/objects/Bill/sync-jobs/${contractJobId}`,
        `raw://${contractImportBatchId}/objects/Deposit/sync-jobs/${contractJobId}`,
        `raw://${contractImportBatchId}/objects/Payment/sync-jobs/${contractJobId}`
      ]
    },
    checkpointRefs: [`checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`],
    companyId: "realm_demo_12345",
    completedAt: "2026-06-15T19:45:00.000Z",
    deltaCounts,
    entityCounts: {
      accounts: 3,
      ledger_entries: 4,
      parties: 2,
      transactions: 3
    },
    errorCount: 0,
    importBatchId: contractImportBatchId,
    jobIds: [contractJobId],
    objectCounts: {
      Account: 3,
      Customer: 1,
      Vendor: 1,
      Bill: 1,
      Deposit: 1,
      Purchase: 0,
      Payment: 1,
      Transfer: 0,
      SalesReceipt: 0,
      CreditMemo: 0,
      RefundReceipt: 0,
      BillPayment: 0,
      VendorCredit: 0
    },
    realmId: "realm_demo_12345",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "succeeded",
    syncJobRefs: [`raw://${contractImportBatchId}/sync-jobs/${contractJobId}`],
    tenantId: contractTenantId,
    totalObjectCount: 8,
    warningCount: 0
  } satisfies HandrailQuickBooksImportBatchSummary,
  importBatches: {
    data: [] as HandrailQuickBooksImportBatchSummary[],
    page: {
      hasMore: false,
      limit: 10
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksImportBatchSummary>,
  items: {
    data: accountingFixtures.items,
    page: {
      cursor: "cursor_items_next",
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksItem>,
  ledgerEntries: {
    data: accountingFixtures.ledgerEntries,
    page: {
      hasMore: false,
      limit: 50
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>,
  locations: {
    data: accountingFixtures.locations,
    page: {
      cursor: "cursor_locations_next",
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksLocation>,
  parties: {
    data: accountingFixtures.parties,
    page: {
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksParty>,
  profitAndLoss: {
    ...reportSnapshotMetadata("profit_and_loss", "2026-05-01_2026-05-31"),
    accountingBasis: "accrual",
    audit: {
      checkpointId: contractCheckpointId,
      importBatchId: contractImportBatchId,
      jobId: contractJobId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}/reports/profit-and-loss/2026-05`,
        `checkpoint://quickbooks/${contractTenantId}/${contractCheckpointId}`
      ]
    },
    currencyCode: "USD",
    generatedAt: "2026-06-15T19:31:30.000Z",
    lines: [
      {
        accountId: "accounting_account_400",
        accountName: "Service Revenue",
        amount: "1250.00",
        drilldown: {
          drilldownId: "report-line-profit-and-loss-income",
          type: "report_line"
        },
        id: "report-line-profit-and-loss-income",
        label: "Service Revenue",
        lineType: "detail",
        section: "income"
      },
      {
        amount: "0.00",
        drilldown: {
          drilldownId: "report-line-profit-and-loss-expenses",
          type: "report_line"
        },
        id: "report-line-profit-and-loss-expenses",
        label: "Expenses",
        lineType: "section",
        section: "expenses"
      },
      {
        amount: "1250.00",
        drilldown: {
          drilldownId: "report-total-profit-and-loss-net-income",
          type: "report_total"
        },
        id: "report-total-profit-and-loss-net-income",
        label: "Net Income",
        lineType: "total"
      }
    ],
    name: "profit_and_loss",
    period: {
      endDate: "2026-05-31",
      startDate: "2026-05-01"
    },
    tenantId: contractTenantId,
    totals: {
      grossProfit: {
        amount: "1250.00",
        label: "Gross Profit"
      },
      netIncome: {
        amount: "1250.00",
        drilldown: {
          drilldownId: "report-total-profit-and-loss-net-income",
          type: "report_total"
        },
        label: "Net Income"
      },
      totalExpenses: {
        amount: "0.00",
        label: "Total Expenses"
      },
      totalIncome: {
        amount: "1250.00",
        label: "Total Income"
      }
    }
  } satisfies HandrailQuickBooksProfitAndLossReport,
  rawImportStatus: {
    audit: {
      checkpointId: contractInitialLoadCheckpointId,
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRefs: [
        `raw://${contractImportBatchId}`,
        contractInitialLoadCheckpointRef
      ]
    },
    checkpoint: initialLoadCheckpointMetadata,
    companyId: "realm_demo_12345",
    completedAt: "2026-06-15T19:45:00.000Z",
    deltaCounts: initialLoadDeltaCounts,
    entity: "accounts",
    errorCount: 0,
    importBatchId: contractImportBatchId,
    importVolume: initialLoadImportVolume,
    objectCount: 8,
    objectType: "Account",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "completed",
    syncMode: "full",
    syncPhase: "initial_load",
    tenantId: contractTenantId,
    warningCount: 0
  } satisfies HandrailQuickBooksRawImportStatus,
  rawImports: {
    data: [] as HandrailQuickBooksRawImportStatus[],
    page: {
      hasMore: false,
      limit: 10
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksRawImportStatus>,
  reconciliation: {
    ...reportSnapshotMetadata("general_ledger", "2026-05-01_2026-05-31"),
    accountId: "accounting_account_100",
    audit: {
      importBatchId: contractImportBatchId,
      qboObjectId: "100",
      realmId: "realm_demo_12345",
      sourcePayloadRef: `raw://${contractImportBatchId}/reconciliations/recon_contract_123`
    },
    difference: "0.00",
    reconciliationId: "recon_contract_123",
    status: "balanced"
  } satisfies HandrailQuickBooksReconciliationResult,
  fullSyncJob: {
    audit: {
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRef: `raw://${contractImportBatchId}/sync-jobs/${contractJobId}`
    },
    batch: undefined as HandrailQuickBooksImportBatchSummary | undefined,
    companyId: "realm_demo_12345",
    completedAt: "2026-06-15T19:45:00.000Z",
    checkpoint: initialLoadCheckpointMetadata,
    deltaCounts: initialLoadDeltaCounts,
    entity: "accounts",
    importBatchId: contractImportBatchId,
    importVolume: initialLoadImportVolume,
    jobId: contractJobId,
    normalizedResources: {
      accounts: accountingFixtures.accounts,
      parties: accountingFixtures.parties,
      transactions: accountingFixtures.transactions
    },
    objectCount: 8,
    objectType: "Account",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "succeeded",
    syncMode: "full",
    syncPhase: "initial_load",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksSyncJobSummary,
  syncJob: {
    audit: {
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRef: `raw://${contractImportBatchId}/sync-jobs/${contractJobId}`
    },
    batch: undefined as HandrailQuickBooksImportBatchSummary | undefined,
    companyId: "realm_demo_12345",
    completedAt: "2026-06-15T19:45:00.000Z",
    checkpoint: incrementalCheckpointMetadata,
    deltaCounts,
    entity: "accounts",
    importBatchId: contractImportBatchId,
    importVolume: incrementalImportVolume,
    jobId: contractJobId,
    normalizedResources: {
      accounts: accountingFixtures.accounts,
      ledger_entries: accountingFixtures.ledgerEntries,
      parties: accountingFixtures.parties,
      transactions: accountingFixtures.transactions
    },
    objectCount: 3,
    objectType: "Account",
    startedAt: "2026-06-15T19:30:00.000Z",
    status: "succeeded",
    syncMode: "incremental",
    syncPhase: "delta_sync",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksSyncJobSummary,
  syncJobs: {
    data: [] as HandrailQuickBooksSyncJobSummary[],
    page: {
      hasMore: false,
      limit: 10
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksSyncJobSummary>,
  tokenStatus: {
    audit: {
      realmId: "realm_demo_12345",
      sourcePayloadRef: "quickbooks-custody://connections/tenant_contract_123"
    },
    connectionId: "qbo_connection_realm_demo_12345",
    expiresAt: "2026-06-15T23:00:00.000Z",
    reauthorizationRequired: false,
    status: "healthy",
    tenantId: contractTenantId
  } satisfies HandrailQuickBooksTokenStatusResponse,
  transactions: {
    data: accountingFixtures.transactions,
    page: {
      hasMore: false,
      limit: 25
    }
  } satisfies HandrailQuickBooksListResponse<HandrailQuickBooksTransaction>,
  trialBalance: {
    ...reportSnapshotMetadata("trial_balance", "2026-05-01_2026-05-31"),
    audit: {
      importBatchId: contractImportBatchId,
      realmId: "realm_demo_12345",
      sourcePayloadRef: `raw://${contractImportBatchId}/reports/trial-balance/2026-05-31`
    },
    generatedAt: "2026-06-15T19:31:00.000Z",
    lines: [
      {
        accountId: "accounting_account_100",
        accountName: "Operating Cash",
        credit: "0.00",
        debit: "1250.00"
      },
      {
        accountId: "accounting_account_400",
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

contractResponses.fullSyncJob.batch = contractResponses.importBatch;
contractResponses.syncJob.batch = contractResponses.importBatch;
contractResponses.checkpoints.data = [contractResponses.checkpoint];
contractResponses.importBatches.data = [contractResponses.importBatch];
contractResponses.rawImports.data = [contractResponses.rawImportStatus];
contractResponses.syncJobs.data = [contractResponses.syncJob];
