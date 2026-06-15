import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksConnectUrlRequest,
  HandrailQuickBooksConnectUrlResponse,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksTokenStatusResponse
} from "../types.js";

export class ConnectionsResource extends HandrailQuickBooksResource {
  status() {
    return this.http.request<HandrailQuickBooksConnectionStatusResponse>(
      this.tenantPath("connections/status")
    );
  }

  connectUrl(request: HandrailQuickBooksConnectUrlRequest = {}) {
    return this.http.request<HandrailQuickBooksConnectUrlResponse>(
      this.tenantPath("connections/connect-url"),
      {
        body: request,
        method: "POST"
      }
    );
  }

  tokenStatus() {
    return this.http.request<HandrailQuickBooksTokenStatusResponse>(
      this.tenantPath("connections/token-status")
    );
  }
}
