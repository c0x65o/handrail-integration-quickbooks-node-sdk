import type {
  HandrailQuickBooksClientConfig,
  HandrailQuickBooksFutureErpTenantContext,
  HandrailQuickBooksFutureErpTenantMap,
  HandrailQuickBooksFutureErpTenantMapping,
  HandrailQuickBooksFutureErpTenantMappingStatus,
  HandrailQuickBooksFutureErpTenantMapResolveOptions,
  HandrailQuickBooksProviderMode,
  HandrailQuickBooksServiceEnv,
  HandrailQuickBooksSdkConfigInput
} from "./types.js";
import { HandrailQuickBooksConfigError } from "./errors.js";

export const DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL = "https://quickbooks.handrail-daas.com";
export const HANDRAIL_QUICKBOOKS_STAGING_BASE_URL =
  "https://quickbooks.hitcents.staging.handrail-daas.com";
export const HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID =
  "future-erp.quickbooks-tenant-mapping.v1";

export const HANDRAIL_QUICKBOOKS_SERVICE_ENVS = [
  "dev",
  "staging",
  "production"
] as const satisfies readonly HandrailQuickBooksServiceEnv[];

export const HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS: Record<
  HandrailQuickBooksServiceEnv,
  string
> = {
  dev: DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL,
  staging: HANDRAIL_QUICKBOOKS_STAGING_BASE_URL,
  production: DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL
} as const;

export const HANDRAIL_QUICKBOOKS_PROVIDER_MODES = [
  "sandbox",
  "production"
] as const satisfies readonly HandrailQuickBooksProviderMode[];

export const HANDRAIL_QUICKBOOKS_ENV_KEYS = {
  apiKey: "HANDRAIL_QBO_API_KEY",
  baseUrl: "HANDRAIL_QBO_BASE_URL",
  providerMode: "HANDRAIL_QBO_PROVIDER_MODE",
  serviceEnv: "HANDRAIL_QBO_SERVICE_ENV",
  tenantId: "HANDRAIL_QBO_TENANT_ID",
  tenantMapJson: "HANDRAIL_QBO_TENANT_MAP_JSON"
} as const;

export const DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS = 10_000;
export const DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES = 2;

export function createQuickBooksSdkConfig(
  input: HandrailQuickBooksSdkConfigInput = {},
  env: NodeJS.ProcessEnv = process.env
): HandrailQuickBooksClientConfig {
  const serviceEnv = readHandrailQuickBooksServiceEnvFromConfig(input, env);
  const providerMode = readHandrailQuickBooksProviderModeFromConfig(input, env);
  const baseUrl =
    input.baseUrl ??
    readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl) ??
    resolveQuickBooksServiceBaseUrl(serviceEnv);
  const apiKey =
    input.apiKey ?? readTrimmedEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey);
  const tenantId = resolveTenantIdFromConfig(input, env, {
    providerMode,
    serviceEnv
  });

  return {
    apiKey,
    auth: input.auth,
    baseUrl,
    fetch: input.fetch,
    providerMode,
    retries: input.retries ?? DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
    serviceEnv,
    tenantId,
    timeoutMs: input.timeoutMs ?? DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS
  };
}

export function resolveQuickBooksServiceBaseUrl(
  serviceEnvOrEnv: HandrailQuickBooksServiceEnv | NodeJS.ProcessEnv | undefined = process.env
): string {
  const serviceEnv =
    typeof serviceEnvOrEnv === "string"
      ? serviceEnvOrEnv
      : readHandrailQuickBooksServiceEnv(serviceEnvOrEnv);

  return serviceEnv
    ? HANDRAIL_QUICKBOOKS_SERVICE_BASE_URLS[serviceEnv]
    : DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL;
}

export function readHandrailQuickBooksServiceEnv(
  env: NodeJS.ProcessEnv = process.env
): HandrailQuickBooksServiceEnv | undefined {
  return parseHandrailQuickBooksServiceEnv(
    readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv),
    HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv
  );
}

export function readHandrailQuickBooksProviderMode(
  env: NodeJS.ProcessEnv = process.env
): HandrailQuickBooksProviderMode | undefined {
  return parseHandrailQuickBooksProviderMode(
    readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode),
    HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode
  );
}

export function parseFutureErpQuickBooksTenantMapJson(
  value: string
): HandrailQuickBooksFutureErpTenantMap {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new HandrailQuickBooksConfigError("Future ERP QuickBooks tenant map JSON is invalid.");
  }

  return parseFutureErpQuickBooksTenantMap(parsed);
}

export function parseFutureErpQuickBooksTenantMap(
  value: unknown
): HandrailQuickBooksFutureErpTenantMap {
  if (!isRecord(value)) {
    throw new HandrailQuickBooksConfigError("Future ERP QuickBooks tenant map is invalid.");
  }

  if (value.schemaVersion !== 1) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map schemaVersion must be 1."
    );
  }

  if (value.contractId !== HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID) {
    throw new HandrailQuickBooksConfigError(
      `Future ERP QuickBooks tenant map contractId must be ${HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID}.`
    );
  }

  const serviceEnv = parseHandrailQuickBooksServiceEnv(
    readOptionalString(value.serviceEnv),
    "tenantMap.serviceEnv"
  );
  const providerMode = parseHandrailQuickBooksProviderMode(
    readOptionalString(value.providerMode),
    "tenantMap.providerMode"
  );

  if (!Array.isArray(value.tenantMappings)) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map tenantMappings must be an array."
    );
  }

  const tenantMappings = value.tenantMappings.map((mapping) =>
    parseFutureErpQuickBooksTenantMapping(mapping)
  );

  assertNoDuplicateFutureErpTenantMappings(tenantMappings);

  return {
    contractId: HANDRAIL_QUICKBOOKS_FUTURE_ERP_TENANT_MAP_CONTRACT_ID,
    consumerProject: readOptionalString(value.consumerProject),
    providerMode,
    schemaVersion: 1,
    serviceEnv,
    sourceOfTruth: readOptionalString(value.sourceOfTruth),
    tenantMappings
  };
}

export function resolveFutureErpQuickBooksTenantId(
  tenantMap: HandrailQuickBooksFutureErpTenantMap,
  context: HandrailQuickBooksFutureErpTenantContext,
  options: HandrailQuickBooksFutureErpTenantMapResolveOptions = {}
): string {
  const parsedTenantMap = parseFutureErpQuickBooksTenantMap(tenantMap);
  const normalizedContext = parseFutureErpQuickBooksTenantContext(context);

  if (options.serviceEnv && parsedTenantMap.serviceEnv && parsedTenantMap.serviceEnv !== options.serviceEnv) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map serviceEnv does not match SDK configuration."
    );
  }

  if (
    options.providerMode &&
    parsedTenantMap.providerMode &&
    parsedTenantMap.providerMode !== options.providerMode
  ) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map providerMode does not match SDK configuration."
    );
  }

  const matches = parsedTenantMap.tenantMappings.filter(
    (mapping) =>
      mapping.futureErpAccountId === normalizedContext.futureErpAccountId &&
      mapping.futureErpCompanyId === normalizedContext.futureErpCompanyId
  );

  if (matches.length === 0) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map has no mapping for the selected account/company."
    );
  }

  if (matches.length > 1) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map has duplicate mappings for the selected account/company."
    );
  }

  const [mapping] = matches;

  if (mapping.status !== "active") {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant mapping is not active."
    );
  }

  if (!mapping.serviceTenantId) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant mapping serviceTenantId is required."
    );
  }

  return mapping.serviceTenantId;
}

function parseHandrailQuickBooksServiceEnv(
  serviceEnv: string | undefined,
  label: string
): HandrailQuickBooksServiceEnv | undefined {
  if (serviceEnv === undefined) {
    return undefined;
  }

  if (isHandrailQuickBooksServiceEnv(serviceEnv)) {
    return serviceEnv;
  }

  throw new HandrailQuickBooksConfigError(
    `${label} must be one of: ${HANDRAIL_QUICKBOOKS_SERVICE_ENVS.join(", ")}`
  );
}

function isHandrailQuickBooksServiceEnv(value: string): value is HandrailQuickBooksServiceEnv {
  return (HANDRAIL_QUICKBOOKS_SERVICE_ENVS as readonly string[]).includes(value);
}

function readHandrailQuickBooksServiceEnvFromConfig(
  input: HandrailQuickBooksSdkConfigInput,
  env: NodeJS.ProcessEnv
) {
  const explicitServiceEnv =
    input.serviceEnv === undefined ? undefined : String(input.serviceEnv).trim();

  return parseHandrailQuickBooksServiceEnv(
    explicitServiceEnv || readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv),
    explicitServiceEnv ? "serviceEnv" : HANDRAIL_QUICKBOOKS_ENV_KEYS.serviceEnv
  );
}

function readHandrailQuickBooksProviderModeFromConfig(
  input: HandrailQuickBooksSdkConfigInput,
  env: NodeJS.ProcessEnv
) {
  const explicitProviderMode =
    input.providerMode === undefined ? undefined : String(input.providerMode).trim();

  return parseHandrailQuickBooksProviderMode(
    explicitProviderMode || readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode),
    explicitProviderMode ? "providerMode" : HANDRAIL_QUICKBOOKS_ENV_KEYS.providerMode
  );
}

function parseHandrailQuickBooksProviderMode(
  value: string | undefined,
  label: string
): HandrailQuickBooksProviderMode | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (isHandrailQuickBooksProviderMode(value)) {
    return value;
  }

  throw new HandrailQuickBooksConfigError(
    `${label} must be one of: ${HANDRAIL_QUICKBOOKS_PROVIDER_MODES.join(", ")}`
  );
}

function isHandrailQuickBooksProviderMode(value: string): value is HandrailQuickBooksProviderMode {
  return (HANDRAIL_QUICKBOOKS_PROVIDER_MODES as readonly string[]).includes(value);
}

function resolveTenantIdFromConfig(
  input: HandrailQuickBooksSdkConfigInput,
  env: NodeJS.ProcessEnv,
  options: HandrailQuickBooksFutureErpTenantMapResolveOptions
) {
  if (input.futureErpTenantContext) {
    const tenantMap = readTenantMapFromConfig(input, env);

    if (!tenantMap) {
      throw new HandrailQuickBooksConfigError(
        "Future ERP QuickBooks tenant map is required when futureErpTenantContext is provided."
      );
    }

    return resolveFutureErpQuickBooksTenantId(tenantMap, input.futureErpTenantContext, options);
  }

  return input.tenantId ?? readTrimmedEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId);
}

function readTenantMapFromConfig(
  input: HandrailQuickBooksSdkConfigInput,
  env: NodeJS.ProcessEnv
): HandrailQuickBooksFutureErpTenantMap | undefined {
  if (input.tenantMap) {
    return parseFutureErpQuickBooksTenantMap(input.tenantMap);
  }

  const tenantMapJson =
    input.tenantMapJson ??
    readOptionalEnvValue(env, HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantMapJson);

  return tenantMapJson ? parseFutureErpQuickBooksTenantMapJson(tenantMapJson) : undefined;
}

function parseFutureErpQuickBooksTenantContext(
  value: HandrailQuickBooksFutureErpTenantContext
): HandrailQuickBooksFutureErpTenantContext {
  const futureErpAccountId = readRequiredString(
    value.futureErpAccountId,
    "futureErpTenantContext.futureErpAccountId"
  );
  const futureErpCompanyId = readRequiredString(
    value.futureErpCompanyId,
    "futureErpTenantContext.futureErpCompanyId"
  );

  return {
    futureErpAccountId,
    futureErpCompanyId
  };
}

function parseFutureErpQuickBooksTenantMapping(
  value: unknown
): HandrailQuickBooksFutureErpTenantMapping {
  if (!isRecord(value)) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant map contains an invalid mapping."
    );
  }

  const status = readRequiredString(value.status, "tenantMap.tenantMappings.status");
  if (!isFutureErpTenantMappingStatus(status)) {
    throw new HandrailQuickBooksConfigError(
      "Future ERP QuickBooks tenant mapping status is invalid."
    );
  }

  return {
    displayName: readOptionalString(value.displayName),
    futureErpAccountId: readRequiredString(
      value.futureErpAccountId,
      "tenantMap.tenantMappings.futureErpAccountId"
    ),
    futureErpCompanyId: readRequiredString(
      value.futureErpCompanyId,
      "tenantMap.tenantMappings.futureErpCompanyId"
    ),
    notes: readOptionalString(value.notes),
    serviceTenantId: readRequiredString(
      value.serviceTenantId,
      "tenantMap.tenantMappings.serviceTenantId"
    ),
    status
  };
}

function assertNoDuplicateFutureErpTenantMappings(
  mappings: readonly HandrailQuickBooksFutureErpTenantMapping[]
) {
  const keys = new Set<string>();

  for (const mapping of mappings) {
    const key = `${mapping.futureErpAccountId}\u0000${mapping.futureErpCompanyId}`;
    if (keys.has(key)) {
      throw new HandrailQuickBooksConfigError(
        "Future ERP QuickBooks tenant map has duplicate account/company mappings."
      );
    }
    keys.add(key);
  }
}

function isFutureErpTenantMappingStatus(
  value: string
): value is HandrailQuickBooksFutureErpTenantMappingStatus {
  return (
    value === "active" ||
    value === "disabled" ||
    value === "pending_connection" ||
    value === "reauthorization_required"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readRequiredString(value: unknown, label: string): string {
  const stringValue = readOptionalString(value);

  if (!stringValue) {
    throw new HandrailQuickBooksConfigError(`${label} is required.`);
  }

  return stringValue;
}

function readOptionalEnvValue(
  env: NodeJS.ProcessEnv,
  key: string
): string | undefined {
  const value = readTrimmedEnvValue(env, key);

  return value ? value : undefined;
}

function readTrimmedEnvValue(env: NodeJS.ProcessEnv, key: string): string | undefined {
  return env[key]?.trim();
}
