import { HandrailQuickBooksConfigError } from "../errors.js";
import type { HandrailQuickBooksHttpClient } from "../http.js";
import type { HandrailQuickBooksClientConfig } from "../types.js";

export abstract class HandrailQuickBooksResource {
  protected readonly config: HandrailQuickBooksClientConfig;
  protected readonly http: HandrailQuickBooksHttpClient;

  constructor(config: HandrailQuickBooksClientConfig, http: HandrailQuickBooksHttpClient) {
    this.config = config;
    this.http = http;
  }

  protected tenantPath(path: string) {
    return this.scopedTenantPath("quickbooks", path);
  }

  protected accountingTenantPath(path: string) {
    return this.scopedTenantPath("accounting", path);
  }

  private scopedTenantPath(scope: "accounting" | "quickbooks", path: string) {
    if (!this.config.tenantId) {
      throw new HandrailQuickBooksConfigError(
        "tenantId is required for tenant-scoped QuickBooks SDK calls."
      );
    }

    return `/v1/tenants/${encodeURIComponent(this.config.tenantId)}/${scope}/${path.replace(
      /^\/+/,
      ""
    )}`;
  }
}
