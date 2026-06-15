import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksTrialBalanceReport,
  HandrailQuickBooksTrialBalanceRequest
} from "../types.js";

export class ReportsResource extends HandrailQuickBooksResource {
  trialBalance(request: HandrailQuickBooksTrialBalanceRequest) {
    return this.http.request<HandrailQuickBooksTrialBalanceReport>(
      this.tenantPath("reports/trial-balance"),
      {
        body: request,
        method: "POST"
      }
    );
  }
}
