import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksReconciliationRequest,
  HandrailQuickBooksReconciliationResult
} from "../types.js";

export class ReconciliationResource extends HandrailQuickBooksResource {
  run(request: HandrailQuickBooksReconciliationRequest, options: { idempotencyKey?: string } = {}) {
    return this.http.request<HandrailQuickBooksReconciliationResult>(
      this.tenantPath("reconciliation/runs"),
      {
        body: request,
        idempotencyKey: options.idempotencyKey,
        method: "POST"
      }
    );
  }
}
