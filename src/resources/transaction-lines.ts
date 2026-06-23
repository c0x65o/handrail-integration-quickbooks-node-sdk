import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksTransactionLineGetResponse,
  HandrailQuickBooksTransactionLineListResponse,
  HandrailQuickBooksTransactionLineSearchResponse,
  HandrailQuickBooksTransactionType
} from "../types.js";

export interface HandrailQuickBooksTransactionLineRequest extends HandrailQuickBooksListRequest {
  readonly accountId?: string;
  readonly classId?: string;
  readonly departmentId?: string;
  readonly from?: string;
  readonly importBatchId?: string;
  readonly itemId?: string;
  readonly partyId?: string;
  readonly sourceObject?: string;
  readonly sourceObjectId?: string;
  readonly sourceUpdatedFrom?: string;
  readonly sourceUpdatedTo?: string;
  readonly to?: string;
  readonly transactionId?: string;
  readonly transactionType?: HandrailQuickBooksTransactionType;
}

export type ListTransactionLinesRequest = HandrailQuickBooksTransactionLineRequest;
export type SearchTransactionLinesRequest = HandrailQuickBooksTransactionLineRequest;

export class TransactionLinesResource extends HandrailQuickBooksResource {
  list(request: ListTransactionLinesRequest = {}) {
    return this.http.request<HandrailQuickBooksTransactionLineListResponse>(
      this.accountingTenantPath("transaction-lines"),
      {
        query: request
      }
    );
  }

  search(request: SearchTransactionLinesRequest = {}) {
    return this.http.request<HandrailQuickBooksTransactionLineSearchResponse>(
      this.accountingTenantPath("transaction-lines"),
      {
        query: request
      }
    );
  }

  get(transactionLineId: string) {
    return this.http.request<HandrailQuickBooksTransactionLineGetResponse>(
      this.accountingTenantPath(`transaction-lines/${encodeURIComponent(transactionLineId)}`)
    );
  }
}
