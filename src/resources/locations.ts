import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksLocation
} from "../types.js";

export interface ListLocationsRequest extends HandrailQuickBooksListRequest {
  readonly active?: boolean;
  readonly isActive?: boolean;
}

export class LocationsResource extends HandrailQuickBooksResource {
  list(request: ListLocationsRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksLocation>>(
      this.accountingTenantPath("locations"),
      {
        query: request
      }
    );
  }

  get(locationId: string) {
    return this.http.request<HandrailQuickBooksLocation>(
      this.accountingTenantPath(`locations/${encodeURIComponent(locationId)}`)
    );
  }
}
