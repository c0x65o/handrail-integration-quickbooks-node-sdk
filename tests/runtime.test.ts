import { describe, expect, it } from "vitest";

import {
  DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
  DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL,
  DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS,
  HANDRAIL_QUICKBOOKS_ENV_KEYS,
  createQuickBooksSdkConfig
} from "../src/index.js";

describe("createQuickBooksSdkConfig", () => {
  it("uses explicit config before env defaults", () => {
    const config = createQuickBooksSdkConfig(
      {
        apiKey: "explicit-api-key",
        baseUrl: "https://example.test",
        tenantId: "explicit-tenant"
      },
      {
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey]: "env-api-key",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl]: "https://env.example.test",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId]: "env-tenant"
      }
    );

    expect(config).toEqual({
      apiKey: "explicit-api-key",
      auth: undefined,
      baseUrl: "https://example.test",
      fetch: undefined,
      retries: DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
      tenantId: "explicit-tenant",
      timeoutMs: DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS
    });
  });

  it("falls back to the Handrail integration service base URL", () => {
    expect(createQuickBooksSdkConfig({}, {}).baseUrl).toBe(DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL);
  });
});
