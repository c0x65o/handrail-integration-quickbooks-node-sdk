import {
  createQuickBooksSdkConfig,
  type HandrailQuickBooksClientConfig,
  type HandrailQuickBooksFutureErpTenantContext,
  type HandrailQuickBooksFutureErpTenantMap,
  type HandrailQuickBooksProviderMode,
  type HandrailQuickBooksSdkConfigInput,
  type HandrailQuickBooksServiceEnv
} from "@handrail/quickbooks-node-sdk";

interface FutureErpStandardQuickBooksEnv {
  readonly HANDRAIL_QBO_API_KEY: string;
  readonly HANDRAIL_QBO_PROVIDER_MODE: HandrailQuickBooksProviderMode;
  readonly HANDRAIL_QBO_SERVICE_ENV: HandrailQuickBooksServiceEnv;
  readonly HANDRAIL_QBO_TENANT_MAP_JSON: string;
}

type AssertEnvKeyAbsent<TEnv, TKey extends PropertyKey> = TKey extends keyof TEnv ? never : true;

const futureErpStandardEnvOmitsBaseUrl: AssertEnvKeyAbsent<
  FutureErpStandardQuickBooksEnv,
  "HANDRAIL_QBO_BASE_URL"
> = true;

const futureErpTenantContext = {
  futureErpAccountId: "future-erp-account-alpha",
  futureErpCompanyId: "future-erp-company-alpha"
} satisfies HandrailQuickBooksFutureErpTenantContext;

const futureErpTenantMap = {
  contractId: "future-erp.quickbooks-tenant-mapping.v1",
  consumerProject: "Hitcents Future ERP",
  providerMode: "sandbox",
  schemaVersion: 1,
  serviceEnv: "staging",
  sourceOfTruth: "Handrail QuickBooks Integration service",
  tenantMappings: [
    {
      ...futureErpTenantContext,
      displayName: "Future ERP Alpha Company",
      serviceTenantId: "tenant_future_erp_alpha",
      status: "active"
    }
  ]
} satisfies HandrailQuickBooksFutureErpTenantMap;

const futureErpStandardEnv = {
  HANDRAIL_QBO_API_KEY: "qbo_service_key_redacted",
  HANDRAIL_QBO_PROVIDER_MODE: "sandbox",
  HANDRAIL_QBO_SERVICE_ENV: "staging",
  HANDRAIL_QBO_TENANT_MAP_JSON: JSON.stringify(futureErpTenantMap)
} satisfies FutureErpStandardQuickBooksEnv & NodeJS.ProcessEnv;

function createFutureErpQuickBooksConfig(
  env: FutureErpStandardQuickBooksEnv
): HandrailQuickBooksSdkConfigInput {
  return {
    apiKey: env.HANDRAIL_QBO_API_KEY,
    futureErpTenantContext,
    providerMode: env.HANDRAIL_QBO_PROVIDER_MODE,
    serviceEnv: env.HANDRAIL_QBO_SERVICE_ENV,
    tenantMapJson: env.HANDRAIL_QBO_TENANT_MAP_JSON
  } satisfies HandrailQuickBooksSdkConfigInput;
}

const futureErpConfigWithoutBaseUrl =
  createFutureErpQuickBooksConfig(futureErpStandardEnv);
const futureErpClientConfigWithoutBaseUrl: HandrailQuickBooksClientConfig =
  createQuickBooksSdkConfig(futureErpConfigWithoutBaseUrl, futureErpStandardEnv);

void [
  futureErpStandardEnvOmitsBaseUrl,
  futureErpConfigWithoutBaseUrl,
  futureErpClientConfigWithoutBaseUrl
];
