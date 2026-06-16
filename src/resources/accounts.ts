import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksAccountType,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export interface ListAccountsRequest extends HandrailQuickBooksListRequest {
  readonly accountType?: HandrailQuickBooksAccountType;
  readonly active?: boolean;
  readonly classification?: string;
  readonly isActive?: boolean;
  readonly type?: HandrailQuickBooksAccountType;
}

export class AccountsResource extends HandrailQuickBooksResource {
  list(request: ListAccountsRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksAccount>>(
      this.accountingTenantPath("accounts"),
      {
        query: request
      }
    );
  }

  get(accountId: string) {
    return this.http.request<HandrailQuickBooksAccount>(
      this.accountingTenantPath(`accounts/${encodeURIComponent(accountId)}`)
    );
  }
}
