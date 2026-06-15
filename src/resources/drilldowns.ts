import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksDrilldownRequest,
  HandrailQuickBooksDrilldownResult
} from "../types.js";

export class DrilldownsResource extends HandrailQuickBooksResource {
  get(request: HandrailQuickBooksDrilldownRequest) {
    return this.http.request<HandrailQuickBooksDrilldownResult>(
      this.tenantPath(
        `drilldowns/${encodeURIComponent(request.type)}/${encodeURIComponent(request.id)}`
      )
    );
  }
}
