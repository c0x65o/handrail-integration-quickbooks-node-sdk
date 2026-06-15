import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncJobSummary
} from "../types.js";

export class SyncJobsResource extends HandrailQuickBooksResource {
  start(request: HandrailQuickBooksStartSyncRequest = {}, options: { idempotencyKey?: string } = {}) {
    return this.http.request<HandrailQuickBooksSyncJobSummary>(this.tenantPath("sync-jobs"), {
      body: request,
      idempotencyKey: options.idempotencyKey,
      method: "POST"
    });
  }

  get(jobId: string) {
    return this.http.request<HandrailQuickBooksSyncJobSummary>(
      this.tenantPath(`sync-jobs/${encodeURIComponent(jobId)}`)
    );
  }

  list(request: HandrailQuickBooksListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksSyncJobSummary>>(
      this.tenantPath("sync-jobs"),
      {
        query: request
      }
    );
  }
}
