import { HandrailQuickBooksResource } from "./base.js";
import { normalizeQuickBooksAccountHierarchy, normalizeQuickBooksAccounts } from "../account-hierarchy.js";
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
  async list(request: ListAccountsRequest = {}) {
    const response = await this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksAccount>>(
      this.accountingTenantPath("accounts"),
      {
        query: request
      }
    );
    return { ...response, data: normalizeQuickBooksAccounts(response.data) };
  }

  async get(accountId: string) {
    const account = await this.http.request<HandrailQuickBooksAccount>(
      this.accountingTenantPath(`accounts/${encodeURIComponent(accountId)}`)
    );
    return normalizeQuickBooksAccountHierarchy(account);
  }
}
