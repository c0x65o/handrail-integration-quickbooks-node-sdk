import { describe, expect, it, vi } from "vitest";

import { runCli } from "../src/cli.js";
import { HandrailQuickBooksError } from "../src/index.js";
import type { CliGlobalConfig, CliQuickBooksClient } from "../src/cli/types.js";
import {
  contractResponses,
  contractTenantId
} from "./fixtures/accounting.js";

describe("handrail-qbo CLI", () => {
  it("prints help without requiring tenant or API key config", async () => {
    const stdout = new StringWriter();
    const stderr = new StringWriter();

    const exitCode = await runCli(["--help"], {
      env: {},
      stderr,
      stdout
    });

    expect(exitCode).toBe(0);
    expect(stdout.value).toContain("handrail-qbo <command> [flags]");
    expect(stdout.value).toContain("connect-url");
    expect(stdout.value).toContain("report trial-balance");
    expect(stdout.value).toContain("token-status");
    expect(stderr.value).toBe("");
  });

  it("reports missing required config without echoing secret values", async () => {
    const stdout = new StringWriter();
    const stderr = new StringWriter();

    const exitCode = await runCli(["status"], {
      env: {
        HANDRAIL_QBO_API_KEY: ""
      },
      stderr,
      stdout
    });

    expect(exitCode).toBe(2);
    expect(stderr.value).toContain("Missing required configuration");
    expect(stderr.value).toContain("tenantId");
    expect(stderr.value).toContain("apiKey");
    expect(stderr.value).not.toContain("HANDRAIL_QBO_API_KEY=");
  });

  it("calls the SDK client for connect-url using flag and env config", async () => {
    const stdout = new StringWriter();
    const stderr = new StringWriter();
    const client = createMockClient();
    let capturedConfig: CliGlobalConfig | undefined;

    const exitCode = await runCli(
      [
        "--tenant-id",
        "tenant_123",
        "connect-url",
        "--return-url",
        "https://erp.example.test/settings/accounting?tab=qbo",
        "--state",
        "state_123"
      ],
      {
        createClient: (config) => {
          capturedConfig = config;
          return client;
        },
        env: {
          HANDRAIL_QBO_API_KEY: "test-secret",
          HANDRAIL_QBO_BASE_URL: "https://quickbooks.example.test"
        },
        stderr,
        stdout
      }
    );

    expect(exitCode).toBe(0);
    expect(capturedConfig).toEqual({
      apiKey: "test-secret",
      baseUrl: "https://quickbooks.example.test",
      retries: undefined,
      tenantId: "tenant_123",
      timeoutMs: undefined
    });
    expect(client.connections.connectUrl).toHaveBeenCalledWith({
      returnUrl: "https://erp.example.test/settings/accounting?tab=qbo",
      state: "state_123"
    });
    expect(JSON.parse(stdout.value)).toEqual(contractResponses.connectUrl);
    expect(stderr.value).toBe("");
  });

  it("prints fixture-backed status and account pull results", async () => {
    const client = createMockClient();
    const statusStdout = new StringWriter();
    const accountsStdout = new StringWriter();

    await expect(runCli(["status"], {
      createClient: () => client,
      env: requiredEnv(),
      stdout: statusStdout
    })).resolves.toBe(0);
    await expect(runCli(["pull-accounts", "--active", "--type", "asset", "--limit", "25"], {
      createClient: () => client,
      env: requiredEnv(),
      stdout: accountsStdout
    })).resolves.toBe(0);

    expect(client.connections.status).toHaveBeenCalledWith();
    expect(client.accounts.list).toHaveBeenCalledWith({
      isActive: true,
      limit: 25,
      type: "asset"
    });
    const statusOutput = JSON.parse(statusStdout.value);
    expect(statusOutput).toEqual(contractResponses.connectionStatus);
    expect(statusOutput.providerEnvironment).toBe("sandbox");
    expect(statusOutput.providerProfile).toEqual({
      environment: "sandbox",
      name: "active",
      status: "configured"
    });
    expect(JSON.parse(accountsStdout.value)).toEqual(contractResponses.accounts);
    expect(statusStdout.value).not.toMatch(/access_token|refresh_token|client_secret|clientId|clientSecret/i);
    expect(accountsStdout.value).not.toMatch(/access_token|refresh_token|client_secret/i);
  });

  it("parses sync command flags into the SDK start request", async () => {
    const stdout = new StringWriter();
    const client = createMockClient();

    const exitCode = await runCli(
      [
        "sync",
        "--entities",
        "accounts,ledger_entries",
        "--mode",
        "incremental",
        "--since",
        "2026-05-01",
        "--idempotency-key",
        "sync-request-123"
      ],
      {
        createClient: () => client,
        env: {
          HANDRAIL_QBO_API_KEY: "test-secret",
          HANDRAIL_QBO_TENANT_ID: "tenant_123"
        },
        stdout
      }
    );

    expect(exitCode).toBe(0);
    expect(client.syncJobs.start).toHaveBeenCalledWith(
      {
        entities: ["accounts", "ledger_entries"],
        mode: "incremental",
        since: "2026-05-01"
      },
      {
        idempotencyKey: "sync-request-123"
      }
    );
  });

  it("parses trial-balance and reconcile command requests", async () => {
    const client = createMockClient();
    const stderr = new StringWriter();
    const stdout = new StringWriter();

    await runCli(
      [
        "report",
        "trial-balance",
        "--as-of",
        "2026-05-31",
        "--basis",
        "cash",
        "--currency",
        "USD"
      ],
      {
        createClient: () => client,
        env: requiredEnv(),
        stderr,
        stdout
      }
    );
    await runCli(
      [
        "reconcile",
        "--account-id",
        "acct_100",
        "--start-date",
        "2026-05-01",
        "--end-date",
        "2026-05-31",
        "--ending-balance",
        "1250.00"
      ],
      {
        createClient: () => client,
        env: requiredEnv(),
        stderr,
        stdout
      }
    );

    expect(client.reports.trialBalance).toHaveBeenCalledWith({
      accountingBasis: "cash",
      asOfDate: "2026-05-31",
      currencyCode: "USD"
    });
    expect(client.reconciliation.run).toHaveBeenCalledWith(
      {
        accountId: "acct_100",
        endingBalance: "1250.00",
        period: {
          endDate: "2026-05-31",
          startDate: "2026-05-01"
        }
      },
      {
        idempotencyKey: undefined
      }
    );
  });

  it("formats service errors with safe diagnostics only", async () => {
    const stdout = new StringWriter();
    const stderr = new StringWriter();
    const client = createMockClient();
    vi.mocked(client.connections.status).mockRejectedValueOnce(
      new HandrailQuickBooksError("Integration service unavailable.", {
        code: "SERVICE_UNAVAILABLE",
        details: {
          token: "do-not-print"
        },
        requestId: "req_123",
        retryable: true,
        status: 503,
        url: "https://quickbooks.example.test/path?apiKey=do-not-print"
      })
    );

    const exitCode = await runCli(["status"], {
      createClient: () => client,
      env: requiredEnv(),
      stderr,
      stdout
    });

    expect(exitCode).toBe(1);
    expect(stderr.value).toContain("Integration service unavailable.");
    expect(stderr.value).toContain("code=SERVICE_UNAVAILABLE");
    expect(stderr.value).toContain("status=503");
    expect(stderr.value).toContain("requestId=req_123");
    expect(stderr.value).not.toContain("do-not-print");
    expect(stdout.value).toBe("");
  });
});

class StringWriter {
  value = "";

  write(chunk: string) {
    this.value += chunk;
  }
}

function requiredEnv() {
  return {
    HANDRAIL_QBO_API_KEY: "test-secret",
    HANDRAIL_QBO_TENANT_ID: contractTenantId
  };
}

function createMockClient(): CliQuickBooksClient {
  return {
    accounts: {
      list: vi.fn().mockResolvedValue(contractResponses.accounts)
    },
    connections: {
      connectUrl: vi.fn().mockResolvedValue(contractResponses.connectUrl),
      status: vi.fn().mockResolvedValue(contractResponses.connectionStatus),
      tokenStatus: vi.fn().mockResolvedValue({
        status: "healthy",
        tenantId: contractTenantId
      })
    },
    rawImports: {
      list: vi.fn().mockResolvedValue({
        data: [],
        page: {
          hasMore: false
        }
      }),
      status: vi.fn().mockResolvedValue({
        importBatchId: "batch_123",
        status: "completed"
      })
    },
    reconciliation: {
      run: vi.fn().mockResolvedValue(contractResponses.reconciliation)
    },
    reports: {
      trialBalance: vi.fn().mockResolvedValue(contractResponses.trialBalance)
    },
    syncJobs: {
      get: vi.fn().mockResolvedValue({
        jobId: "sync_123",
        status: "queued"
      }),
      list: vi.fn().mockResolvedValue({
        data: [],
        page: {
          hasMore: false
        }
      }),
      start: vi.fn().mockResolvedValue(contractResponses.syncJob)
    }
  };
}
