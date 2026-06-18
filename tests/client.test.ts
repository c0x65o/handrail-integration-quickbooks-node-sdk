import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  HandrailQuickBooksClient,
  HandrailQuickBooksConfigError,
  HandrailQuickBooksError,
  type HandrailQuickBooksFetch
} from "../src/index.js";
import {
  accountingFixtures,
  contractCheckpointId,
  contractApiKey,
  contractBaseUrl,
  contractImportBatchId,
  contractJobId,
  contractRequests,
  contractResponses,
  contractTenantId
} from "./fixtures/accounting.js";

interface CapturedRequest {
  readonly init?: RequestInit;
  readonly input: Request | string | URL;
}

const unsafeProviderPayloadPattern =
  /"access_token"|"refresh_token"|"client_secret"|"Authorization"|"authorization"|"clientId"|"clientSecret"|"apiKey"|"rawProviderPayload"|"rawPayload"|"QueryResponse"|"providerError"|"rawProviderError"|stored-access-token|stored-refresh-token|do-not-print|raw provider payload/i;

describe("HandrailQuickBooksClient", () => {
  it("builds tenant-scoped connection status requests", async () => {
    const { fetch, requests } = mockFetch([
      {
        providerMode: "sandbox",
        status: "connected",
        tenantId: "tenant_123"
      }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test/api",
      fetch,
      providerMode: "sandbox",
      tenantId: "tenant_123"
    });

    await expect(client.connections.status()).resolves.toEqual({
      providerMode: "sandbox",
      status: "connected",
      tenantId: "tenant_123"
    });

    expect(client.config.providerMode).toBe("sandbox");
    expect(requests).toHaveLength(1);
    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/api/v1/tenants/tenant_123/quickbooks/connections/status"
    );
    expect(requests[0].init?.method).toBe("GET");
    const headers = new Headers(requests[0].init?.headers);
    expect(headers.get("authorization")).toBe("Bearer test-api-key");
    expect(headers.get("x-handrail-tenant-id")).toBe("tenant_123");
    expect(headers.has("x-handrail-qbo-provider-mode")).toBe(false);
  });

  it("uses fixture contracts for representative service requests and responses", async () => {
    const { fetch, requests } = mockFetch([
      contractResponses.connectionStatus,
      contractResponses.tokenStatus,
      contractResponses.connectUrl,
      contractResponses.accounts,
      contractResponses.parties,
      contractResponses.transactions,
      contractResponses.syncJob,
      contractResponses.syncJob,
      contractResponses.syncJobs,
      contractResponses.rawImportStatus,
      contractResponses.rawImports,
      contractResponses.importBatch,
      contractResponses.importBatches,
      contractResponses.checkpoint,
      contractResponses.checkpoints,
      contractResponses.trialBalance,
      contractResponses.profitAndLoss,
      contractResponses.balanceSheet,
      contractResponses.cashFlow,
      contractResponses.generalLedger,
      contractResponses.accountsReceivableAging,
      contractResponses.accountsPayableAging,
      contractResponses.ledgerEntries,
      contractResponses.ledgerEntries,
      contractResponses.reconciliation,
      contractResponses.drilldown
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: contractApiKey,
      baseUrl: contractBaseUrl,
      fetch,
      tenantId: contractTenantId
    });

    const connectionStatus = await client.connections.status();
    const tokenStatus = await client.connections.tokenStatus();
    const connectUrl = await client.connections.connectUrl(contractRequests.connectUrl);
    const accounts = await client.accounts.list({
      accountType: "Bank",
      active: true,
      cursor: "cursor_accounts_after",
      limit: 25
    });
    const parties = await client.parties.list({
      limit: 25,
      partyType: "customer"
    });
    const transactions = await client.transactions.list({
      limit: 25,
      transactionType: "payment"
    });
    const syncJob = await client.syncJobs.start(contractRequests.startSync, {
      idempotencyKey: "sync-contract-idempotency-key"
    });
    const syncJobStatus = await client.syncJobs.get(contractJobId);
    const syncJobs = await client.syncJobs.list({
      limit: 10
    });
    const rawImportStatus = await client.rawImports.status(contractImportBatchId);
    const rawImports = await client.rawImports.list({
      limit: 10
    });
    const importBatch = await client.importBatches.get(contractImportBatchId);
    const importBatches = await client.importBatches.list({
      limit: 10
    });
    const checkpoint = await client.checkpoints.get(contractCheckpointId);
    const checkpoints = await client.checkpoints.list({
      entity: "accounts",
      limit: 2,
      objectType: "Account",
      syncMode: "incremental"
    });
    const trialBalance = await client.reports.trialBalance(contractRequests.trialBalance);
    const profitAndLoss = await client.reports.profitAndLoss(contractRequests.profitAndLoss);
    const balanceSheet = await client.reports.balanceSheet(contractRequests.balanceSheet);
    const cashFlow = await client.reports.cashFlow(contractRequests.cashFlow);
    const generalLedger = await client.reports.generalLedger(contractRequests.generalLedger);
    const accountsReceivableAging = await client.reports.accountsReceivableAging(
      contractRequests.aging
    );
    const accountsPayableAging = await client.reports.accountsPayableAging(
      contractRequests.aging
    );
    const ledgerList = await client.ledgerEntries.list({
      limit: 50
    });
    const ledgerEntries = await client.ledgerEntries.search(contractRequests.ledgerSearch);
    const reconciliation = await client.reconciliation.run(contractRequests.reconciliation, {
      idempotencyKey: "reconcile-contract-idempotency-key"
    });
    const drilldown = await client.drilldowns.get(contractRequests.drilldown);

    expect(connectionStatus).toEqual(contractResponses.connectionStatus);
    expect(tokenStatus).toEqual(contractResponses.tokenStatus);
    expect(connectUrl).toEqual(contractResponses.connectUrl);
    expect(accounts).toEqual(contractResponses.accounts);
    expect(accounts.data[0]).toMatchObject({
      provider: "intuit",
      source: "quickbooks_accounting_api",
      sourceObject: "Account",
      accountType: "Bank",
      classification: "Asset",
      sourceObjectId: "100"
    });
    expect(parties).toEqual(contractResponses.parties);
    expect(parties.data[0]).toMatchObject({
      partyType: "customer",
      sourceObject: "Customer"
    });
    expect(transactions).toEqual(contractResponses.transactions);
    expect(transactions.data[0]).toMatchObject({
      sourceObject: "Payment",
      transactionType: "payment"
    });
    expect(transactions.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceObject: "Bill",
          transactionType: "bill"
        }),
        expect.objectContaining({
          sourceObject: "Deposit",
          transactionType: "deposit"
        })
      ])
    );
    expect(syncJob).toEqual(contractResponses.syncJob);
    expect(syncJob).toMatchObject({
      tenantId: contractTenantId,
      objectType: "Account",
      deltaCounts: {
        changedCount: 1,
        failedCount: 0,
        insertedCount: 3,
        skippedCount: 2
      },
      importVolume: {
        objectCount: 3,
        totalObjectCount: 3
      },
      syncMode: "incremental",
      syncPhase: "delta_sync"
    });
    expect(syncJob.checkpoint).toMatchObject({
      checkpointId: "quickbooks_incremental_accounts_Account",
      checkpointKind: "provider_updated_at_watermark",
      checkpointRef:
        "checkpoint://quickbooks/tenant_contract_123/quickbooks_incremental_accounts_Account",
      providerUpdatedAtWatermark: "2026-06-15T19:25:00.000Z",
      syncMode: "incremental"
    });
    expect(syncJob.batch).toEqual(contractResponses.importBatch);
    expect(syncJobStatus).toEqual(contractResponses.syncJob);
    expect(syncJobs).toEqual(contractResponses.syncJobs);
    expect(rawImportStatus).toEqual(contractResponses.rawImportStatus);
    expect(rawImportStatus).toMatchObject({
      tenantId: contractTenantId,
      objectType: "Account",
      deltaCounts: {
        changedCount: 0,
        failedCount: 0,
        insertedCount: 8,
        skippedCount: 0
      },
      importVolume: {
        objectCount: 8,
        totalObjectCount: 8
      },
      syncMode: "full",
      syncPhase: "initial_load"
    });
    expect(rawImportStatus.checkpoint).toMatchObject({
      checkpointId: "quickbooks_full_initial_load_accounts_Account",
      checkpointKind: "provider_updated_at_watermark",
      checkpointRef:
        "checkpoint://quickbooks/tenant_contract_123/quickbooks_full_initial_load_accounts_Account",
      providerUpdatedAtWatermark: "2026-06-15T19:25:00.000Z",
      syncMode: "full"
    });
    expect(rawImports).toEqual(contractResponses.rawImports);
    expect(importBatch).toEqual(contractResponses.importBatch);
    expect(importBatches).toEqual(contractResponses.importBatches);
    expect(checkpoint).toEqual(contractResponses.checkpoint);
    expect(checkpoints).toEqual(contractResponses.checkpoints);
    expect(trialBalance).toEqual(contractResponses.trialBalance);
    expect(profitAndLoss).toEqual(contractResponses.profitAndLoss);
    expect(profitAndLoss).toMatchObject({
      checkpointRefs: [`checkpoint://quickbooks/${contractTenantId}/quickbooks_incremental_accounts_Account`],
      importBatchId: "batch_contract_2026_05",
      reportSnapshotId:
        "quickbooks_profit_and_loss_tenant_contract_123_2026-05-01_2026-05-31_batch_contract_2026_05",
      reportSnapshotRef:
        "report-snapshot://quickbooks/tenant_contract_123/quickbooks_profit_and_loss_tenant_contract_123_2026-05-01_2026-05-31_batch_contract_2026_05",
      sourceRefs: [
        "raw://batch_contract_2026_05/reports/profit-and-loss/2026-05-01_2026-05-31"
      ]
    });
    expect(balanceSheet).toEqual(contractResponses.balanceSheet);
    expect(cashFlow).toEqual(contractResponses.cashFlow);
    expect(generalLedger).toEqual(contractResponses.generalLedger);
    expect(accountsReceivableAging).toEqual(contractResponses.accountsReceivableAging);
    expect(accountsPayableAging).toEqual(contractResponses.accountsPayableAging);
    expect(ledgerList).toEqual(contractResponses.ledgerEntries);
    expect(ledgerEntries).toEqual(contractResponses.ledgerEntries);
    expect(ledgerEntries.data[0]).toMatchObject({
      lineId: "1",
      postingType: "Debit",
      account: {
        value: "100"
      },
      party: {
        value: "300"
      }
    });
    expect(reconciliation).toEqual(contractResponses.reconciliation);
    expect(reconciliation.reportSnapshotId).toBe(
      "quickbooks_general_ledger_tenant_contract_123_2026-05-01_2026-05-31_batch_contract_2026_05"
    );
    expect(drilldown).toEqual(contractResponses.drilldown);
    expect(drilldown).toMatchObject({
      checkpointRefs: [`checkpoint://quickbooks/${contractTenantId}/quickbooks_incremental_accounts_Account`],
      reportSnapshotId:
        "quickbooks_profit_and_loss_tenant_contract_123_latest_latest_batch_contract_2026_05",
      sourceRefs: [
        "raw://batch_contract_2026_05/reports/profit-and-loss/latest_latest"
      ]
    });
    expect(drilldown).toMatchObject({
      reportName: "profit_and_loss",
      relatedLedgerEntries: [
        {
          id: "accounting_ledger_entry_payment_700_2"
        }
      ],
      relatedTransactions: [
        {
          id: "accounting_transaction_payment_700"
        }
      ]
    });

    expect(requests).toHaveLength(26);
    expect(requestUrl(requests[0])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/connections/status`
    );
    expect(requests[0].init?.method).toBe("GET");

    expect(requestUrl(requests[1])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/connections/token-status`
    );
    expect(requests[1].init?.method).toBe("GET");

    expect(requestUrl(requests[2])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/connections/connect-url`
    );
    expect(requests[2].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[2].init?.body))).toEqual(contractRequests.connectUrl);

    const accountsUrl = new URL(requestUrl(requests[3]));
    expect(accountsUrl.origin + accountsUrl.pathname).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/accounts`
    );
    expect(accountsUrl.searchParams.get("accountType")).toBe("Bank");
    expect(accountsUrl.searchParams.get("active")).toBe("true");
    expect(accountsUrl.searchParams.get("cursor")).toBe("cursor_accounts_after");
    expect(accountsUrl.searchParams.get("limit")).toBe("25");
    expect(requests[3].init?.method).toBe("GET");

    expect(requestUrl(requests[4])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/parties?limit=25&partyType=customer`
    );
    expect(requests[4].init?.method).toBe("GET");

    expect(requestUrl(requests[5])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/transactions?limit=25&transactionType=payment`
    );
    expect(requests[5].init?.method).toBe("GET");

    expect(requestUrl(requests[6])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/sync-jobs`
    );
    expect(requests[6].init?.method).toBe("POST");
    expect(new Headers(requests[6].init?.headers).get("idempotency-key")).toBe(
      "sync-contract-idempotency-key"
    );
    expect(JSON.parse(String(requests[6].init?.body))).toEqual(contractRequests.startSync);

    expect(requestUrl(requests[7])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/sync-jobs/${contractJobId}`
    );
    expect(requests[7].init?.method).toBe("GET");

    expect(requestUrl(requests[8])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/sync-jobs?limit=10`
    );
    expect(requests[8].init?.method).toBe("GET");

    expect(requestUrl(requests[9])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/raw-imports/${contractImportBatchId}/status`
    );
    expect(requests[9].init?.method).toBe("GET");

    expect(requestUrl(requests[10])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/raw-imports?limit=10`
    );
    expect(requests[10].init?.method).toBe("GET");

    expect(requestUrl(requests[11])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/import-batches/${contractImportBatchId}`
    );
    expect(requests[11].init?.method).toBe("GET");

    expect(requestUrl(requests[12])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/import-batches?limit=10`
    );
    expect(requests[12].init?.method).toBe("GET");

    expect(requestUrl(requests[13])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/checkpoints/${contractCheckpointId}`
    );
    expect(requests[13].init?.method).toBe("GET");

    const checkpointsUrl = new URL(requestUrl(requests[14]));
    expect(checkpointsUrl.origin + checkpointsUrl.pathname).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/checkpoints`
    );
    expect(checkpointsUrl.searchParams.get("entity")).toBe("accounts");
    expect(checkpointsUrl.searchParams.get("limit")).toBe("2");
    expect(checkpointsUrl.searchParams.get("objectType")).toBe("Account");
    expect(checkpointsUrl.searchParams.get("syncMode")).toBe("incremental");
    expect(requests[14].init?.method).toBe("GET");

    expect(requestUrl(requests[15])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/reports/trial-balance`
    );
    expect(requests[15].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[15].init?.body))).toEqual(contractRequests.trialBalance);

    expect(requestUrl(requests[16])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/profit-and-loss`
    );
    expect(requests[16].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[16].init?.body))).toEqual(contractRequests.profitAndLoss);

    expect(requestUrl(requests[17])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/balance-sheet`
    );
    expect(requests[17].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[17].init?.body))).toEqual(contractRequests.balanceSheet);

    expect(requestUrl(requests[18])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/cash-flow`
    );
    expect(requests[18].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[18].init?.body))).toEqual(contractRequests.cashFlow);

    expect(requestUrl(requests[19])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/general-ledger`
    );
    expect(requests[19].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[19].init?.body))).toEqual(contractRequests.generalLedger);

    expect(requestUrl(requests[20])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/accounts-receivable-aging`
    );
    expect(requests[20].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[20].init?.body))).toEqual(contractRequests.aging);

    expect(requestUrl(requests[21])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/reports/accounts-payable-aging`
    );
    expect(requests[21].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[21].init?.body))).toEqual(contractRequests.aging);

    expect(requestUrl(requests[22])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/ledger-entries?limit=50`
    );
    expect(requests[22].init?.method).toBe("GET");

    expect(requestUrl(requests[23])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/ledger-entries/search`
    );
    expect(requests[23].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[23].init?.body))).toEqual(contractRequests.ledgerSearch);

    expect(requestUrl(requests[24])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/reconciliation/runs`
    );
    expect(requests[24].init?.method).toBe("POST");
    expect(new Headers(requests[24].init?.headers).get("idempotency-key")).toBe(
      "reconcile-contract-idempotency-key"
    );
    expect(JSON.parse(String(requests[24].init?.body))).toEqual(contractRequests.reconciliation);

    expect(requestUrl(requests[25])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/drilldowns/report_line/report-line-profit-and-loss-income`
    );
    expect(requests[25].init?.method).toBe("GET");

    const headers = new Headers(requests[0].init?.headers);
    expect(headers.get("authorization")).toBe(`Bearer ${contractApiKey}`);
    expect(headers.get("x-handrail-tenant-id")).toBe(contractTenantId);
    expect(JSON.stringify([
      connectionStatus,
      tokenStatus,
      connectUrl,
      accounts,
      syncJob,
      syncJobStatus,
      rawImportStatus,
      rawImports,
      importBatch,
      importBatches,
      checkpoint,
      checkpoints,
      trialBalance,
      profitAndLoss,
      balanceSheet,
      cashFlow,
      generalLedger,
      accountsReceivableAging,
      accountsPayableAging,
      ledgerList,
      ledgerEntries,
      reconciliation,
      drilldown
    ])).not.toMatch(unsafeProviderPayloadPattern);
  });

  it("pins cursor query params and returned pages for list resources", async () => {
    const page = {
      cursor: "cursor_next_contract",
      hasMore: true,
      limit: 7
    };
    const { fetch, requests } = mockFetch([
      { data: accountingFixtures.accounts, page },
      { data: accountingFixtures.parties, page },
      { data: accountingFixtures.transactions, page },
      { data: accountingFixtures.ledgerEntries, page },
      { data: [contractResponses.syncJob], page },
      { data: [contractResponses.rawImportStatus], page },
      { data: [contractResponses.importBatch], page },
      { data: [contractResponses.checkpoint], page }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: contractApiKey,
      baseUrl: contractBaseUrl,
      fetch,
      tenantId: contractTenantId
    });

    const responses = [
      await client.accounts.list({ cursor: "cursor_in_accounts", limit: 7 }),
      await client.parties.list({ cursor: "cursor_in_parties", limit: 7 }),
      await client.transactions.list({ cursor: "cursor_in_transactions", limit: 7 }),
      await client.ledgerEntries.list({ cursor: "cursor_in_ledger", limit: 7 }),
      await client.syncJobs.list({ cursor: "cursor_in_sync_jobs", limit: 7 }),
      await client.rawImports.list({ cursor: "cursor_in_raw_imports", limit: 7 }),
      await client.importBatches.list({ cursor: "cursor_in_import_batches", limit: 7 }),
      await client.checkpoints.list({ cursor: "cursor_in_checkpoints", limit: 7 })
    ];

    expect(responses.map((response) => response.page)).toEqual([
      page,
      page,
      page,
      page,
      page,
      page,
      page,
      page
    ]);
    expect(requests.map((request) => new URL(requestUrl(request)).searchParams.get("limit"))).toEqual([
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7",
      "7"
    ]);
    expect(requests.map((request) => new URL(requestUrl(request)).searchParams.get("cursor"))).toEqual([
      "cursor_in_accounts",
      "cursor_in_parties",
      "cursor_in_transactions",
      "cursor_in_ledger",
      "cursor_in_sync_jobs",
      "cursor_in_raw_imports",
      "cursor_in_import_batches",
      "cursor_in_checkpoints"
    ]);
  });

  it("exposes optional item, class, and Department-backed location resources", async () => {
    const { fetch, requests } = mockFetch([
      contractResponses.items,
      contractResponses.classes,
      contractResponses.locations
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: contractApiKey,
      baseUrl: contractBaseUrl,
      fetch,
      tenantId: contractTenantId
    });

    const items = await client.items.list({
      active: true,
      itemType: "Service",
      limit: 25
    });
    const classes = await client.classes.list({
      active: true,
      limit: 25
    });
    const locations = await client.locations.list({
      active: true,
      limit: 25
    });

    expect(items).toEqual(contractResponses.items);
    expect(items.data[0]).toMatchObject({
      sourceObject: "Item",
      sourceObjectId: "700",
      itemType: "Service",
      incomeAccountRef: {
        value: "400"
      }
    });
    expect(classes).toEqual(contractResponses.classes);
    expect(classes.data[0]).toMatchObject({
      sourceObject: "Class",
      sourceObjectId: "810",
      status: "active"
    });
    expect(locations).toEqual(contractResponses.locations);
    expect(locations.data[0]).toMatchObject({
      sourceObject: "Department",
      locationSource: "department",
      locationObjectStatus: "mapped_to_department",
      unsupportedProviderObject: "Location"
    });

    expect(requestUrl(requests[0])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/items?active=true&itemType=Service&limit=25`
    );
    expect(requestUrl(requests[1])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/classes?active=true&limit=25`
    );
    expect(requestUrl(requests[2])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/accounting/locations?active=true&limit=25`
    );
    expect(JSON.stringify([items, classes, locations])).not.toMatch(unsafeProviderPayloadPattern);
  });

  it("pins example response contracts and excludes provider payload leakage", () => {
    const contractsDir = new URL("../examples/contracts/", import.meta.url);
    const contractFiles = readdirSync(contractsDir)
      .filter((fileName) => fileName.endsWith(".response.json"))
      .sort();

    expect(contractFiles).toEqual([
      "accounts.response.json",
      "ap-aging.response.json",
      "ar-aging.response.json",
      "balance-sheet.response.json",
      "cash-flow.response.json",
      "cdc-sync-start.response.json",
      "checkpoints.response.json",
      "classes.response.json",
      "connect-url.response.json",
      "connection-status.response.json",
      "drilldown.response.json",
      "general-ledger.response.json",
      "import-batch.response.json",
      "items.response.json",
      "ledger-search.response.json",
      "locations.response.json",
      "parties.response.json",
      "profit-and-loss.response.json",
      "raw-import-status.response.json",
      "reconciliation.response.json",
      "token-status.response.json",
      "transactions.response.json",
      "trial-balance.response.json"
    ]);

    const examples = Object.fromEntries(
      contractFiles.map((fileName) => [
        fileName,
        JSON.parse(readFileSync(new URL(fileName, contractsDir), "utf8")) as unknown
      ])
    );
    expect(JSON.stringify(examples)).not.toMatch(unsafeProviderPayloadPattern);
    expect(examples["accounts.response.json"]).toMatchObject({
      data: [
        {
          accountType: "Bank",
          id: "accounting_account_100",
          provider: "intuit",
          source: "quickbooks_accounting_api",
          sourceObject: "Account",
          tenantId: contractTenantId
        }
      ],
      page: {
        cursor: "cursor_accounts_next",
        hasMore: false,
        limit: 25
      }
    });
    expect(examples["items.response.json"]).toMatchObject({
      data: [
        {
          id: "accounting_item_700",
          provider: "intuit",
          source: "quickbooks_accounting_api",
          sourceObject: "Item",
          tenantId: contractTenantId
        }
      ]
    });
    expect(examples["classes.response.json"]).toMatchObject({
      data: [
        {
          id: "accounting_class_810",
          provider: "intuit",
          source: "quickbooks_accounting_api",
          sourceObject: "Class",
          tenantId: contractTenantId
        }
      ]
    });
    expect(examples["locations.response.json"]).toMatchObject({
      data: [
        {
          id: "accounting_location_department_910",
          locationObjectStatus: "mapped_to_department",
          sourceObject: "Department",
          tenantId: contractTenantId,
          unsupportedProviderObject: "Location"
        }
      ]
    });
    expect(examples["raw-import-status.response.json"]).toMatchObject({
      checkpoint: {
        checkpointKind: "provider_updated_at_watermark",
        syncMode: "full"
      },
      importVolume: {
        objectCount: 8,
        totalObjectCount: 8
      },
      syncMode: "full",
      syncPhase: "initial_load"
    });
    expect(examples["cdc-sync-start.response.json"]).toMatchObject({
      checkpoint: {
        checkpointKind: "provider_updated_at_watermark",
        syncMode: "incremental"
      },
      importVolume: {
        objectCount: 3,
        totalObjectCount: 3
      },
      syncMode: "incremental",
      syncPhase: "delta_sync"
    });
    const profitAndLoss = examples["profit-and-loss.response.json"] as {
      checkpointRefs: string[];
      lines: Array<{ drilldown?: { type?: string } }>;
      name: string;
      reportSnapshotId: string;
      reportSnapshotRef: string;
      sourceRefs: string[];
      totals: { netIncome: { amount: string } };
    };
    expect(profitAndLoss.name).toBe("profit_and_loss");
    expect(profitAndLoss.reportSnapshotId).toBe(
      "quickbooks_profit_and_loss_tenant_contract_123_2026-05-01_2026-05-31_batch_contract_2026_05"
    );
    expect(profitAndLoss.reportSnapshotRef).toBe(
      "report-snapshot://quickbooks/tenant_contract_123/quickbooks_profit_and_loss_tenant_contract_123_2026-05-01_2026-05-31_batch_contract_2026_05"
    );
    expect(profitAndLoss.sourceRefs).toEqual([
      "raw://batch_contract_2026_05/reports/profit-and-loss/2026-05-01_2026-05-31"
    ]);
    expect(profitAndLoss.checkpointRefs).toEqual([
      "checkpoint://quickbooks/tenant_contract_123/quickbooks_incremental_accounts_Account"
    ]);
    expect(profitAndLoss.lines.some((line) => line.drilldown?.type === "report_line")).toBe(true);
    expect(profitAndLoss.totals.netIncome.amount).toBe("1250.00");
    expect(examples["drilldown.response.json"]).toMatchObject({
      reportSnapshotId:
        "quickbooks_profit_and_loss_tenant_contract_123_latest_latest_batch_contract_2026_05",
      sourceRefs: [
        "raw://batch_contract_2026_05/reports/profit-and-loss/latest_latest"
      ],
      relatedAuditReferences: [
        {
          sourcePayloadRef: "raw://batch_contract_2026_05/reports/profit-and-loss/2026-05"
        }
      ],
      relatedLedgerEntries: [
        {
          id: "accounting_ledger_entry_payment_700_2"
        }
      ],
      reportName: "profit_and_loss",
      type: "report_line"
    });
  });

  it("builds connect URL requests", async () => {
    const { fetch, requests } = mockFetch([
      {
        connectUrl: "https://quickbooks.example.test/connect/abc",
        tenantId: "tenant_123"
      }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch,
      providerMode: "sandbox",
      tenantId: "tenant_123"
    });

    await client.connections.connectUrl({
      returnUrl: "https://erp.example.test/settings/accounting"
    });

    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/connections/connect-url"
    );
    expect(requests[0].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      returnUrl: "https://erp.example.test/settings/accounting"
    });
    expect(requestUrl(requests[0])).not.toContain("providerMode=");
  });

  it("builds token status diagnostics requests", async () => {
    const { fetch, requests } = mockFetch([
      {
        status: "healthy",
        tenantId: "tenant_123"
      }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch,
      tenantId: "tenant_123"
    });

    await client.connections.tokenStatus();

    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/connections/token-status"
    );
    expect(requests[0].init?.method).toBe("GET");
  });

  it("builds sync, trial balance, and ledger search requests", async () => {
    const { fetch, requests } = mockFetch([
      {
        jobId: "sync_123",
        status: "queued"
      },
      {
        generatedAt: "2026-06-15T00:00:00.000Z",
        lines: [],
        name: "trial_balance",
        period: {
          endDate: "2026-05-31",
          startDate: "2026-05-01"
        },
        tenantId: "tenant_123"
      },
      {
        data: [],
        page: {
          hasMore: false
        }
      }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch,
      tenantId: "tenant_123"
    });

    await client.syncJobs.start(
      {
        entities: ["accounts", "ledger_entries"],
        mode: "incremental"
      },
      {
        idempotencyKey: "sync-request-123"
      }
    );
    await client.reports.trialBalance({
      asOfDate: "2026-05-31"
    });
    await client.ledgerEntries.search({
      accountId: "acct_100",
      from: "2026-05-01",
      to: "2026-05-31"
    });

    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/sync-jobs"
    );
    expect(new Headers(requests[0].init?.headers).get("idempotency-key")).toBe("sync-request-123");
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      entities: ["accounts", "ledger_entries"],
      mode: "incremental"
    });

    expect(requestUrl(requests[1])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/reports/trial-balance"
    );
    expect(JSON.parse(String(requests[1].init?.body))).toEqual({
      asOfDate: "2026-05-31"
    });

    expect(requestUrl(requests[2])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/accounting/ledger-entries/search"
    );
    expect(JSON.parse(String(requests[2].init?.body))).toEqual({
      accountId: "acct_100",
      from: "2026-05-01",
      to: "2026-05-31"
    });
  });

  it("supports API-key auth header configuration", async () => {
    const { fetch, requests } = mockFetch([
      {
        data: [],
        page: {
          hasMore: false
        }
      },
      {
        data: [],
        page: {
          hasMore: false
        }
      },
      {
        data: [],
        page: {
          hasMore: false
        }
      }
    ]);
    const client = new HandrailQuickBooksClient({
      auth: {
        headerName: "x-handrail-api-key",
        scheme: "api-key",
        token: "test-api-key"
      },
      baseUrl: "https://quickbooks.example.test",
      fetch,
      tenantId: "tenant_123"
    });

    await client.accounts.list({
      isActive: true,
      limit: 50,
      type: "asset"
    });
    await client.parties.list({
      limit: 25,
      type: "customer"
    });
    await client.transactions.list({
      limit: 10,
      type: "invoice"
    });

    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/accounting/accounts?isActive=true&limit=50&type=asset"
    );
    expect(requestUrl(requests[1])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/accounting/parties?limit=25&type=customer"
    );
    expect(requestUrl(requests[2])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/accounting/transactions?limit=10&type=invoice"
    );
    expect(new Headers(requests[0].init?.headers).get("x-handrail-api-key")).toBe("test-api-key");
  });

  it("throws structured service errors with sanitized details only", async () => {
    const { fetch } = mockFetch(
      [
        {
          code: "SERVICE_UNAVAILABLE",
          details: {
            authorization: "Bearer stored-access-token",
            clientSecret: "do-not-print",
            providerError: {
              Fault: {
                Error: [
                  {
                    Message: "raw provider payload"
                  }
                ]
              }
            },
            rawProviderPayload: {
              QueryResponse: {
                Account: [
                  {
                    Id: "100",
                    Name: "Provider shape must not cross the SDK boundary."
                  }
                ]
              }
            },
            retryAfterMs: 5000,
            tokenStatus: "redacted_by_service",
            upstream: "quickbooks-integration"
          },
          message: "Integration service is temporarily unavailable.",
          requestId: "req_123"
        }
      ],
      503
    );
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch,
      retries: 0,
      tenantId: "tenant_123"
    });

    let caughtError: unknown;
    try {
      await client.connections.status();
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(HandrailQuickBooksError);
    const error = caughtError as HandrailQuickBooksError;
    expect(error).toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      details: {
        retryAfterMs: 5000,
        tokenStatus: "redacted_by_service",
        upstream: "quickbooks-integration"
      },
      requestId: "req_123",
      retryable: true,
      status: 503
    });
    const serializedError = JSON.stringify({
      code: error.code,
      details: error.details,
      message: error.message,
      requestId: error.requestId,
      retryable: error.retryable,
      status: error.status,
      url: error.url
    });
    expect(serializedError).toContain("quickbooks-integration");
    expect(serializedError).not.toMatch(unsafeProviderPayloadPattern);
  });

  it("requires tenantId for tenant-scoped calls", () => {
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch: mockFetch([]).fetch
    });

    expect(() => client.connections.status()).toThrow(HandrailQuickBooksConfigError);
  });

  it("retries idempotent reads", async () => {
    const { fetch, requests } = mockFetch(
      [
        {
          code: "TEMPORARY_FAILURE",
          message: "Try again."
        },
        {
          status: "connected",
          tenantId: "tenant_123"
        }
      ],
      [503, 200]
    );
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test",
      fetch,
      retries: 1,
      tenantId: "tenant_123"
    });

    await expect(client.connections.status()).resolves.toEqual({
      status: "connected",
      tenantId: "tenant_123"
    });
    expect(requests).toHaveLength(2);
  });
});

function mockFetch(
  bodies: readonly unknown[],
  statuses: number | readonly number[] = 200
): { fetch: HandrailQuickBooksFetch; requests: CapturedRequest[] } {
  const requests: CapturedRequest[] = [];
  let index = 0;
  const fetch: HandrailQuickBooksFetch = async (input, init) => {
    requests.push({
      init,
      input
    });

    const status = Array.isArray(statuses) ? statuses[index] ?? 200 : statuses;
    const body = bodies[index];
    index += 1;

    return Response.json(body, {
      status
    });
  };

  return {
    fetch,
    requests
  };
}

function requestUrl(request: CapturedRequest) {
  if (request.input instanceof Request) {
    return request.input.url;
  }

  return request.input.toString();
}
