import { describe, expect, it } from "vitest";

import {
  HandrailQuickBooksClient,
  HandrailQuickBooksConfigError,
  type HandrailQuickBooksFetch
} from "../src/index.js";
import {
  contractApiKey,
  contractBaseUrl,
  contractRequests,
  contractResponses,
  contractTenantId
} from "./fixtures/accounting.js";

interface CapturedRequest {
  readonly init?: RequestInit;
  readonly input: Request | string | URL;
}

describe("HandrailQuickBooksClient", () => {
  it("builds tenant-scoped connection status requests", async () => {
    const { fetch, requests } = mockFetch([
      {
        status: "connected",
        tenantId: "tenant_123"
      }
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: "test-api-key",
      baseUrl: "https://quickbooks.example.test/api",
      fetch,
      tenantId: "tenant_123"
    });

    await expect(client.connections.status()).resolves.toEqual({
      status: "connected",
      tenantId: "tenant_123"
    });

    expect(requests).toHaveLength(1);
    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/api/v1/tenants/tenant_123/quickbooks/connections/status"
    );
    expect(requests[0].init?.method).toBe("GET");
    const headers = new Headers(requests[0].init?.headers);
    expect(headers.get("authorization")).toBe("Bearer test-api-key");
    expect(headers.get("x-handrail-tenant-id")).toBe("tenant_123");
  });

  it("uses fixture contracts for representative service requests and responses", async () => {
    const { fetch, requests } = mockFetch([
      contractResponses.connectionStatus,
      contractResponses.connectUrl,
      contractResponses.accounts,
      contractResponses.syncJob,
      contractResponses.trialBalance,
      contractResponses.ledgerSearch,
      contractResponses.reconciliation
    ]);
    const client = new HandrailQuickBooksClient({
      apiKey: contractApiKey,
      baseUrl: contractBaseUrl,
      fetch,
      tenantId: contractTenantId
    });

    const connectionStatus = await client.connections.status();
    const connectUrl = await client.connections.connectUrl(contractRequests.connectUrl);
    const accounts = await client.accounts.list({
      isActive: true,
      limit: 25,
      type: "asset"
    });
    const syncJob = await client.syncJobs.start(contractRequests.startSync, {
      idempotencyKey: "sync-contract-idempotency-key"
    });
    const trialBalance = await client.reports.trialBalance(contractRequests.trialBalance);
    const ledgerEntries = await client.ledgerEntries.search(contractRequests.ledgerSearch);
    const reconciliation = await client.reconciliation.run(contractRequests.reconciliation, {
      idempotencyKey: "reconcile-contract-idempotency-key"
    });

    expect(connectionStatus).toEqual(contractResponses.connectionStatus);
    expect(connectUrl).toEqual(contractResponses.connectUrl);
    expect(accounts).toEqual(contractResponses.accounts);
    expect(syncJob).toEqual(contractResponses.syncJob);
    expect(trialBalance).toEqual(contractResponses.trialBalance);
    expect(ledgerEntries).toEqual(contractResponses.ledgerSearch);
    expect(reconciliation).toEqual(contractResponses.reconciliation);

    expect(requests).toHaveLength(7);
    expect(requestUrl(requests[0])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/connections/status`
    );
    expect(requests[0].init?.method).toBe("GET");

    expect(requestUrl(requests[1])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/connections/connect-url`
    );
    expect(requests[1].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[1].init?.body))).toEqual(contractRequests.connectUrl);

    const accountsUrl = new URL(requestUrl(requests[2]));
    expect(accountsUrl.origin + accountsUrl.pathname).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/accounts`
    );
    expect(accountsUrl.searchParams.get("isActive")).toBe("true");
    expect(accountsUrl.searchParams.get("limit")).toBe("25");
    expect(accountsUrl.searchParams.get("type")).toBe("asset");
    expect(requests[2].init?.method).toBe("GET");

    expect(requestUrl(requests[3])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/sync-jobs`
    );
    expect(requests[3].init?.method).toBe("POST");
    expect(new Headers(requests[3].init?.headers).get("idempotency-key")).toBe(
      "sync-contract-idempotency-key"
    );
    expect(JSON.parse(String(requests[3].init?.body))).toEqual(contractRequests.startSync);

    expect(requestUrl(requests[4])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/reports/trial-balance`
    );
    expect(requests[4].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[4].init?.body))).toEqual(contractRequests.trialBalance);

    expect(requestUrl(requests[5])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/ledger-entries/search`
    );
    expect(requests[5].init?.method).toBe("POST");
    expect(JSON.parse(String(requests[5].init?.body))).toEqual(contractRequests.ledgerSearch);

    expect(requestUrl(requests[6])).toBe(
      `${contractBaseUrl}/v1/tenants/${contractTenantId}/quickbooks/reconciliation/runs`
    );
    expect(requests[6].init?.method).toBe("POST");
    expect(new Headers(requests[6].init?.headers).get("idempotency-key")).toBe(
      "reconcile-contract-idempotency-key"
    );
    expect(JSON.parse(String(requests[6].init?.body))).toEqual(contractRequests.reconciliation);

    const headers = new Headers(requests[0].init?.headers);
    expect(headers.get("authorization")).toBe(`Bearer ${contractApiKey}`);
    expect(headers.get("x-handrail-tenant-id")).toBe(contractTenantId);
    expect(JSON.stringify([
      connectionStatus,
      connectUrl,
      accounts,
      syncJob,
      trialBalance,
      ledgerEntries,
      reconciliation
    ])).not.toMatch(/access_token|refresh_token|client_secret/i);
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
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/ledger-entries/search"
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
      type: "asset"
    });

    expect(requestUrl(requests[0])).toBe(
      "https://quickbooks.example.test/v1/tenants/tenant_123/quickbooks/accounts?isActive=true&type=asset"
    );
    expect(new Headers(requests[0].init?.headers).get("x-handrail-api-key")).toBe("test-api-key");
  });

  it("throws structured service errors", async () => {
    const { fetch } = mockFetch(
      [
        {
          code: "SERVICE_UNAVAILABLE",
          details: {
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

    await expect(client.connections.status()).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      requestId: "req_123",
      retryable: true,
      status: 503
    });
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
