import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksParty,
  HandrailQuickBooksPartyType
} from "../types.js";

export interface ListPartiesRequest extends HandrailQuickBooksListRequest {
  readonly isActive?: boolean;
  readonly type?: HandrailQuickBooksPartyType;
}

export class PartiesResource extends HandrailQuickBooksResource {
  list(request: ListPartiesRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksParty>>(
      this.tenantPath("parties"),
      {
        query: request
      }
    );
  }

  get(partyId: string) {
    return this.http.request<HandrailQuickBooksParty>(
      this.tenantPath(`parties/${encodeURIComponent(partyId)}`)
    );
  }
}
