import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksItem,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export interface ListItemsRequest extends HandrailQuickBooksListRequest {
  readonly active?: boolean;
  readonly isActive?: boolean;
  readonly itemType?: string;
  readonly type?: string;
}

export class ItemsResource extends HandrailQuickBooksResource {
  list(request: ListItemsRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksItem>>(
      this.accountingTenantPath("items"),
      {
        query: request
      }
    );
  }

  get(itemId: string) {
    return this.http.request<HandrailQuickBooksItem>(
      this.accountingTenantPath(`items/${encodeURIComponent(itemId)}`)
    );
  }
}
