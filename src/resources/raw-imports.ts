import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksRawImportStatus
} from "../types.js";

export class RawImportsResource extends HandrailQuickBooksResource {
  status(importBatchId: string) {
    return this.http.request<HandrailQuickBooksRawImportStatus>(
      this.tenantPath(`raw-imports/${encodeURIComponent(importBatchId)}/status`)
    );
  }

  list(request: HandrailQuickBooksListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksRawImportStatus>>(
      this.tenantPath("raw-imports"),
      {
        query: request
      }
    );
  }
}
