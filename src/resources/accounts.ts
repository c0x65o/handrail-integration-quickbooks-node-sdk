import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export interface ListAccountsRequest extends HandrailQuickBooksListRequest {
  readonly isActive?: boolean;
  readonly type?: HandrailQuickBooksAccount["type"];
}

export class AccountsResource extends HandrailQuickBooksResource {
  list(request: ListAccountsRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksAccount>>(
      this.tenantPath("accounts"),
      {
        query: request
      }
    );
  }

  get(accountId: string) {
    return this.http.request<HandrailQuickBooksAccount>(
      this.tenantPath(`accounts/${encodeURIComponent(accountId)}`)
    );
  }
}
