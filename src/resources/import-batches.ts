import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksImportBatchListRequest,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksListResponse
} from "../types.js";

export class ImportBatchesResource extends HandrailQuickBooksResource {
  get(importBatchId: string) {
    return this.http.request<HandrailQuickBooksImportBatchSummary>(
      this.tenantPath(`import-batches/${encodeURIComponent(importBatchId)}`)
    );
  }

  list(request: HandrailQuickBooksImportBatchListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksImportBatchSummary>>(
      this.tenantPath("import-batches"),
      {
        query: request
      }
    );
  }
}
