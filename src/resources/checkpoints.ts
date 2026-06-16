import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksCheckpointListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksSyncCheckpoint
} from "../types.js";

export class CheckpointsResource extends HandrailQuickBooksResource {
  get(checkpointId: string) {
    return this.http.request<HandrailQuickBooksSyncCheckpoint>(
      this.tenantPath(`checkpoints/${encodeURIComponent(checkpointId)}`)
    );
  }

  list(request: HandrailQuickBooksCheckpointListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksSyncCheckpoint>>(
      this.tenantPath("checkpoints"),
      {
        query: request
      }
    );
  }
}
