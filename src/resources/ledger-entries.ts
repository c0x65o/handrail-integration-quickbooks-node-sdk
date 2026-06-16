import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksLedgerSearchRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export class LedgerEntriesResource extends HandrailQuickBooksResource {
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
