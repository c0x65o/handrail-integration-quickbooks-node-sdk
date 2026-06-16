import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksLedgerSearchRequest,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export class LedgerEntriesResource extends HandrailQuickBooksResource {
  list(request: HandrailQuickBooksListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>>(
      this.accountingTenantPath("ledger-entries"),
      {
        query: request
      }
    );
  }

  search(request: HandrailQuickBooksLedgerSearchRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksLedgerEntry>>(
      this.accountingTenantPath("ledger-entries/search"),
      {
        body: request,
        method: "POST"
      }
    );
  }

  get(ledgerEntryId: string) {
    return this.http.request<HandrailQuickBooksLedgerEntry>(
      this.accountingTenantPath(`ledger-entries/${encodeURIComponent(ledgerEntryId)}`)
    );
  }
}
