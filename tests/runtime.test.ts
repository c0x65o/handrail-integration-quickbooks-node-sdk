import { describe, expect, it } from "vitest";

import {
  DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
  DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL,
  DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS,
  HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
  HANDRAIL_QUICKBOOKS_ENV_KEYS,
  HANDRAIL_QUICKBOOKS_PROVIDER_MODES,
  HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS,
  HANDRAIL_QUICKBOOKS_SERVICE_ENVS,
<<<<<<< HEAD
  HANDRAIL_QUICKBOOKS_STAGING_BASE_URL,
=======
>>>>>>> origin/main
  createQuickBooksSdkConfig,
  parseFutureErpQuickBooksTenantMapJson,
  readHandrailQuickBooksProviderMode,
  readHandrailQuickBooksServiceEnv,
  resolveFutureErpQuickBooksTenantId
} from "../src/index.js";

describe("createQuickBooksSdkConfig", () => {
  it("uses explicit config before env defaults", () => {
    const config = createQuickBooksSdkConfig(
      {
        apiKey: "explicit-api-key",
        baseUrl: "https://example.test",
        providerMode: "production",
        tenantId: "explicit-tenant"
      },
      {
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey]: "env-api-key",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl]: "https://env.example.test",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "sandbox",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "production",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId]: "env-tenant"
      }
    );

    expect(config).toEqual({
      apiKey: "explicit-api-key",
      auth: undefined,
      baseUrl: "https://example.test",
      fetch: undefined,
      providerMode: "production",
      retries: DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
      serviceEnv: "production",
      tenantId: "explicit-tenant",
      timeoutMs: DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS
    });
  });

  it("uses HANDRAIL_QBO_BASE_URL as a local override before service env", () => {
    const config = createQuickBooksSdkConfig(
      {},
      {
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl]: " https://local-quickbooks.example.test ",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "production"
      }
    );

    expect(config.baseUrl).toBe("https://local-quickbooks.example.test");
  });

  it("reads trimmed HANDRAIL_QBO_PROVIDER_MODE values", () => {
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: " sandbox "
        }
      ).providerMode
    ).toBe("sandbox");
    expect(
      readHandrailQuickBooksProviderMode({
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: " production "
      })
    ).toBe("production");
  });

  it("exports supported provider mode values", () => {
    expect(HANDRAIL_QUICKBOOKS_PROVIDER_MODES).toEqual(["sandbox", "production"]);
  });

  it("accepts sandbox and production provider modes", () => {
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "sandbox"
        }
      ).providerMode
    ).toBe("sandbox");
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "production"
        }
      ).providerMode
    ).toBe("production");
  });

  it("derives the service URL from HANDRAIL_QBO_SERVICE_ENV without HANDRAIL_QBO_BASE_URL", () => {
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: " staging "
        }
      ).baseUrl
    ).toBe(HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS.staging);
  });

  it("falls back to the Handrail integration service base URL", () => {
    expect(createQuickBooksSdkConfig({}, {}).baseUrl).toBe(DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL);
  });

  it("exports the supported service env values and current repo-owned URL mapping", () => {
    expect(HANDRAIL_QUICKBOOKS_SERVICE_ENVS).toEqual(["dev", "staging", "production"]);
    expect(HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS).toEqual({
      dev: DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL,
<<<<<<< HEAD
      staging: HANDRAIL_QUICKBOOKS_STAGING_BASE_URL,
=======
      staging: DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL,
>>>>>>> origin/main
      production: DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL
    });
  });

  it("rejects invalid non-empty HANDRAIL_QBO_SERVICE_ENV values", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "sandbox"
        }
      )
    ).toThrow("HANDRAIL_QBO_SERVICE_ENV must be one of: dev, staging, production");
  });

  it("rejects invalid non-empty HANDRAIL_QBO_PROVIDER_MODE values", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "dev"
        }
      )
    ).toThrow("HANDRAIL_QBO_PROVIDER_MODE must be one of: sandbox, production");
    expect(() =>
      createQuickBooksSdkConfig(
        {
          providerMode: "dev" as "sandbox"
        },
        {}
      )
    ).toThrow("providerMode must be one of: sandbox, production");
  });

  it("treats blank HANDRAIL_QBO_PROVIDER_MODE as missing", () => {
    expect(
      readHandrailQuickBooksProviderMode({
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "   "
      })
    ).toBeUndefined();
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "   "
        }
      ).providerMode
    ).toBeUndefined();
  });

  it("treats blank HANDRAIL_QBO_SERVICE_ENV as missing", () => {
    expect(
      readHandrailQuickBooksServiceEnv({
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "   "
      })
    ).toBeUndefined();
    expect(
      createQuickBooksSdkConfig(
        {},
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "   "
        }
      ).baseUrl
    ).toBe(DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL);
  });

  it("ignores Intuit provider credentials because the SDK only configures service access", () => {
    const config = createQuickBooksSdkConfig(
      {},
      {
        INTUIT_CLIENT_ID: "intuit-client-id",
        INTUIT_CLIENT_SECRET: "intuit-client-secret",
        INTUIT_ENVIRONMENT: "production",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey]: "service-api-key",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl]: "https://quickbooks.example.test",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId]: "tenant_123"
      }
    );

    expect(config).toEqual({
      apiKey: "service-api-key",
      auth: undefined,
      baseUrl: "https://quickbooks.example.test",
      fetch: undefined,
      providerMode: undefined,
      retries: DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
      serviceEnv: undefined,
      tenantId: "tenant_123",
      timeoutMs: DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS
    });
    expect(JSON.stringify(config)).not.toContain("intuit-client-secret");
    expect(JSON.stringify(config)).not.toContain("production");
  });
});

describe("Future ERP QuickBooks tenant maps", () => {
  it("resolves multiple Future ERP account/company pairs to distinct service tenant ids", () => {
    const tenantMap = futureErpTenantMap({
      tenantMappings: [
        futureErpTenantMapping({
          futureErpAccountId: "acct_alpha",
          futureErpCompanyId: "company_a",
          serviceTenantId: "qbo-tenant-alpha"
        }),
        futureErpTenantMapping({
          futureErpAccountId: "acct_alpha",
          futureErpCompanyId: "company_b",
          serviceTenantId: "qbo-tenant-beta"
        })
      ]
    });

    expect(
      resolveFutureErpQuickBooksTenantId(
        tenantMap,
        {
          futureErpAccountId: "acct_alpha",
          futureErpCompanyId: "company_a"
        },
        {
          providerMode: "sandbox",
          serviceEnv: "staging"
        }
      )
    ).toBe("qbo-tenant-alpha");
    expect(
      resolveFutureErpQuickBooksTenantId(
        tenantMap,
        {
          futureErpAccountId: "acct_alpha",
          futureErpCompanyId: "company_b"
        },
        {
          providerMode: "sandbox",
          serviceEnv: "staging"
        }
      )
    ).toBe("qbo-tenant-beta");
  });

  it("resolves SDK tenantId from HANDRAIL_QBO_TENANT_MAP_JSON without HANDRAIL_QBO_BASE_URL", () => {
    const config = createQuickBooksSdkConfig(
      {
        futureErpTenantContext: {
          futureErpAccountId: "acct_alpha",
          futureErpCompanyId: "company_a"
        }
      },
      {
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey]: "service-api-key",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "sandbox",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "staging",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson]: JSON.stringify(futureErpTenantMap())
      }
    );

    expect(config.baseUrl).toBe(HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS.staging);
    expect(config.providerMode).toBe("sandbox");
    expect(config.serviceEnv).toBe("staging");
    expect(config.tenantId).toBe("qbo-tenant-alpha");
    expect(JSON.stringify(config)).not.toContain("tenantMappings");
  });

  it("rejects invalid JSON and wrong contract artifacts without exposing the payload", () => {
    expect(() => parseFutureErpQuickBooksTenantMapJson("{not json")).toThrow(
      "Future ERP QuickBooks tenant map JSON is invalid."
    );
    expect(() =>
      parseFutureErpQuickBooksTenantMapJson(
        JSON.stringify({
          ...futureErpTenantMap(),
          contractId: "other.contract"
        })
      )
    ).toThrow(
      "Future ERP QuickBooks tenant map contractId must be future-erp.quickbooks-tenant-mapping.v1."
    );
    expect(() =>
      parseFutureErpQuickBooksTenantMapJson(
        JSON.stringify({
          ...futureErpTenantMap(),
          schemaVersion: 2
        })
      )
    ).toThrow("Future ERP QuickBooks tenant map schemaVersion must be 1.");
  });

  it("fails closed for tenant map service env and provider mode mismatches", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {
          futureErpTenantContext: {
            futureErpAccountId: "acct_alpha",
            futureErpCompanyId: "company_a"
          },
          tenantMap: futureErpTenantMap()
        },
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "sandbox",
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "production"
        }
      )
    ).toThrow("Future ERP QuickBooks tenant map serviceEnv does not match SDK configuration.");

    expect(() =>
      createQuickBooksSdkConfig(
        {
          futureErpTenantContext: {
            futureErpAccountId: "acct_alpha",
            futureErpCompanyId: "company_a"
          },
          tenantMap: futureErpTenantMap()
        },
        {
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "production",
          [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "staging"
        }
      )
    ).toThrow("Future ERP QuickBooks tenant map providerMode does not match SDK configuration.");
  });

  it("does not fall back to HANDRAIL_QBO_TENANT_ID for duplicate tenant map entries", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {
          futureErpTenantContext: {
            futureErpAccountId: "acct_alpha",
            futureErpCompanyId: "company_a"
          },
          tenantMap: futureErpTenantMap({
            tenantMappings: [
              futureErpTenantMapping(),
              futureErpTenantMapping({
                serviceTenantId: "qbo-tenant-duplicate"
              })
            ]
          })
        },
        fallbackTenantEnv()
      )
    ).toThrow("Future ERP QuickBooks tenant map has duplicate account/company mappings.");
  });

  it("does not fall back to HANDRAIL_QBO_TENANT_ID for missing tenant map entries", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {
          futureErpTenantContext: {
            futureErpAccountId: "acct_alpha",
            futureErpCompanyId: "company_missing"
          },
          tenantMap: futureErpTenantMap()
        },
        fallbackTenantEnv()
      )
    ).toThrow("Future ERP QuickBooks tenant map has no mapping for the selected account/company.");
  });

  it.each(["disabled", "pending_connection", "reauthorization_required"] as const)(
    "does not fall back to HANDRAIL_QBO_TENANT_ID for %s mappings",
    (status) => {
      expect(() =>
        createQuickBooksSdkConfig(
          {
            futureErpTenantContext: {
              futureErpAccountId: "acct_alpha",
              futureErpCompanyId: "company_a"
            },
            tenantMap: futureErpTenantMap({
              tenantMappings: [
                futureErpTenantMapping({
                  status
                })
              ]
            })
          },
          fallbackTenantEnv()
        )
      ).toThrow("Future ERP QuickBooks tenant mapping is not active.");
    }
  );

  it("does not fall back to HANDRAIL_QBO_TENANT_ID for blank service tenant ids", () => {
    expect(() =>
      createQuickBooksSdkConfig(
        {
          futureErpTenantContext: {
            futureErpAccountId: "acct_alpha",
            futureErpCompanyId: "company_a"
          },
          tenantMap: {
            ...futureErpTenantMap(),
            tenantMappings: [
              {
                ...futureErpTenantMapping(),
                serviceTenantId: "   "
              }
            ]
          }
        },
        fallbackTenantEnv()
      )
    ).toThrow("tenantMap.tenantMappings.serviceTenantId is required.");
  });

  it("preserves explicit tenantId for local/operator use", () => {
    const config = createQuickBooksSdkConfig(
      {
        tenantId: "operator-tenant"
      },
      {
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "staging",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId]: "env-tenant",
        [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson]: "{not json"
      }
    );

    expect(config.tenantId).toBe("operator-tenant");
  });
});

function futureErpTenantMap(
  overrides: Partial<ReturnType<typeof futureErpTenantMapShape>> = {}
) {
  return {
    ...futureErpTenantMapShape(),
    ...overrides
  };
}

function futureErpTenantMapShape() {
  return {
    contractId: HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
    consumerProject: "Hitcents Future ERP",
    providerMode: "sandbox",
    schemaVersion: 1,
    serviceEnv: "staging",
    sourceOfTruth: "Handrail QuickBooks Integration service",
    tenantMappings: [futureErpTenantMapping()]
  } as const;
}

function futureErpTenantMapping(
  overrides: Partial<ReturnType<typeof futureErpTenantMappingShape>> = {}
) {
  return {
    ...futureErpTenantMappingShape(),
    ...overrides
  };
}

function futureErpTenantMappingShape() {
  return {
    futureErpAccountId: "acct_alpha",
    futureErpCompanyId: "company_a",
    serviceTenantId: "qbo-tenant-alpha",
    status: "active"
  } as const;
}

function fallbackTenantEnv() {
  return {
    [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]: "sandbox",
    [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]: "staging",
    [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId]: "fallback-tenant"
  };
}
