import {
  HANDRAIL_QUICKBOOKS_ENV_KEYS,
  HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
  parseFutureErpQuickBooksTenantMapJson
} from "../runtime.js";
import type {
  HandrailQuickBooksFutureErpTenantMap,
  HandrailQuickBooksFutureErpTenantMapping
} from "../types.js";
import type { CliCommandContext } from "./types.js";

const REDACTED_API_KEY = "REDACTED_QBO_SERVICE_API_KEY";
const API_KEY_PLACEHOLDER = "REPLACE_WITH_HANDRAIL_QBO_API_KEY";
const PROVIDER_MODE_PLACEHOLDER = "REPLACE_WITH_HANDRAIL_QBO_PROVIDER_MODE";
const SERVICE_ENV_PLACEHOLDER = "REPLACE_WITH_HANDRAIL_QBO_SERVICE_ENV";

export function withFutureErpConfigArtifact<TOutput extends object>(
  output: TOutput,
  context: CliCommandContext
) {
  return {
    ...output,
    futureErpConfig: buildFutureErpConfigArtifact(context),
    ...(context.config.baseUrlOverride
      ? {
        localOverrideDiagnostics: {
          quickBooksBaseUrl: {
            ...context.config.baseUrlOverride,
            futureErpConfig: "excluded"
          }
        }
      }
      : {})
  };
}

function buildFutureErpConfigArtifact(context: CliCommandContext) {
  const tenantMap = futureErpTenantMapForOutput(context);

  return {
    schemaVersion: 1,
    artifact: "future-erp.quickbooks-runtime-config.redacted.v1",
    purpose: "Copyable redacted Future ERP QuickBooks runtime config.",
    copyableEnv: {
      [HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv]:
        context.config.serviceEnv ?? tenantMap.value.serviceEnv ?? SERVICE_ENV_PLACEHOLDER,
      [HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode]:
        context.config.providerMode ?? tenantMap.value.providerMode ?? PROVIDER_MODE_PLACEHOLDER,
      [HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey]:
        context.config.apiKey ? REDACTED_API_KEY : API_KEY_PLACEHOLDER,
      [HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson]: JSON.stringify(tenantMap.value)
    },
    tenantMap,
    redactions: [
      "HANDRAIL_QBO_API_KEY is always redacted.",
      "Future ERP account ids, company ids, display names, and notes are redacted or templated.",
      "Intuit OAuth token material, client secrets, Authorization headers, and provider source data are never included."
    ]
  };
}

function futureErpTenantMapForOutput(context: CliCommandContext) {
  if (context.config.tenantMapJson) {
    return {
      envName: HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson,
      redacted: true,
      source: "env",
      value: redactTenantMap(
        parseFutureErpQuickBooksTenantMapJson(context.config.tenantMapJson)
      )
    };
  }

  return {
    envName: HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson,
    redacted: true,
    source: "operator_tenant_id_template",
    value: tenantMapTemplate(context)
  };
}

function redactTenantMap(
  tenantMap: HandrailQuickBooksFutureErpTenantMap
): HandrailQuickBooksFutureErpTenantMap {
  return {
    contractId: HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
    consumerProject: tenantMap.consumerProject,
    providerMode: tenantMap.providerMode,
    schemaVersion: 1,
    serviceEnv: tenantMap.serviceEnv,
    sourceOfTruth: tenantMap.sourceOfTruth,
    tenantMappings: tenantMap.tenantMappings.map(redactTenantMapping)
  };
}

function redactTenantMapping(
  mapping: HandrailQuickBooksFutureErpTenantMapping,
  index: number
): HandrailQuickBooksFutureErpTenantMapping {
  const ordinal = index + 1;

  return {
    displayName: mapping.displayName ? `REDACTED_DISPLAY_NAME_${ordinal}` : undefined,
    futureErpAccountId: `REDACTED_FUTURE_ERP_ACCOUNT_ID_${ordinal}`,
    futureErpCompanyId: `REDACTED_FUTURE_ERP_COMPANY_ID_${ordinal}`,
    notes: mapping.notes ? `REDACTED_NOTES_${ordinal}` : undefined,
    serviceTenantId: mapping.serviceTenantId,
    status: mapping.status
  };
}

function tenantMapTemplate(context: CliCommandContext) {
  return {
    schemaVersion: 1,
    contractId: HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
    consumerProject: "Hitcents Future ERP",
    sourceOfTruth: "Handrail QuickBooks Integration service",
    ...(context.config.serviceEnv ? { serviceEnv: context.config.serviceEnv } : {}),
    ...(context.config.providerMode ? { providerMode: context.config.providerMode } : {}),
    tenantMappings: [
      {
        futureErpAccountId: "REPLACE_WITH_FUTURE_ERP_ACCOUNT_ID",
        futureErpCompanyId: "REPLACE_WITH_FUTURE_ERP_COMPANY_ID",
        serviceTenantId: context.config.tenantId ?? "REPLACE_WITH_HANDRAIL_QBO_SERVICE_TENANT_ID",
        displayName: "REDACTED_FUTURE_ERP_COMPANY_DISPLAY_NAME",
        status: "active"
      }
    ]
  };
}
