import type {
  HandrailQuickBooksClientConfig,
  HandrailQuickBooksSdkConfigInput
} from "./types.js";

export const DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL = "https://quickbooks.handrail-daas.com";

export const HANDRAIL_QUICKBOOKS_ENV_KEYS = {
  apiKey: "HANDRAIL_QBO_API_KEY",
  baseUrl: "HANDRAIL_QBO_BASE_URL",
  tenantId: "HANDRAIL_QBO_TENANT_ID"
} as const;

export const DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS = 10_000;
export const DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES = 2;

export function createQuickBooksSdkConfig(
  input: HandrailQuickBooksSdkConfigInput = {},
  env: NodeJS.ProcessEnv = process.env
): HandrailQuickBooksClientConfig {
  const baseUrl =
    input.baseUrl ??
    env[HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl] ??
    DEFAULT_HANDRAIL_QUICKBOOKS_BASE_URL;
  const apiKey = input.apiKey ?? env[HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey];
  const tenantId = input.tenantId ?? env[HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId];

  return {
    apiKey,
    auth: input.auth,
    baseUrl,
    fetch: input.fetch,
    retries: input.retries ?? DEFAULT_HANDRAIL_QUICKBOOKS_RETRIES,
    tenantId,
    timeoutMs: input.timeoutMs ?? DEFAULT_HANDRAIL_QUICKBOOKS_TIMEOUT_MS
  };
}
