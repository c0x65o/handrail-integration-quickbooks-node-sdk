import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksTransaction
} from "../types.js";

export interface ListTransactionsRequest extends HandrailQuickBooksListRequest {
  readonly from?: string;
  readonly partyId?: string;
  readonly to?: string;
  readonly type?: string;
}

export class TransactionsResource extends HandrailQuickBooksResource {
  list(request: ListTransactionsRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksTransaction>>(
      this.accountingTenantPath("transactions"),
      {
        query: request
      }
    );
  }

  get(transactionId: string) {
    return this.http.request<HandrailQuickBooksTransaction>(
      this.accountingTenantPath(`transactions/${encodeURIComponent(transactionId)}`)
    );
  }
}
