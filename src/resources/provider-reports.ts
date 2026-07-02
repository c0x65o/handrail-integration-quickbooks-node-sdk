import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksProviderReportRequest,
  HandrailQuickBooksProviderReportResponse
} from "../types.js";

/**
 * QuickBooks-owned report passthrough (Reports API) used for reconciling
 * downstream ERP statements against QuickBooks' own report engine.
 */
export class ProviderReportsResource extends HandrailQuickBooksResource {
  get(request: HandrailQuickBooksProviderReportRequest) {
    return this.http.request<HandrailQuickBooksProviderReportResponse>(
      this.tenantPath("provider-reports"),
      {
        body: request,
        method: "POST"
      }
    );
  }

  trialBalance(request: Omit<HandrailQuickBooksProviderReportRequest, "reportName">) {
    return this.get({ ...request, reportName: "trial_balance" });
  }

  profitAndLoss(request: Omit<HandrailQuickBooksProviderReportRequest, "reportName">) {
    return this.get({ ...request, reportName: "profit_and_loss" });
  }

  balanceSheet(request: Omit<HandrailQuickBooksProviderReportRequest, "reportName">) {
    return this.get({ ...request, reportName: "balance_sheet" });
  }

  generalLedger(request: Omit<HandrailQuickBooksProviderReportRequest, "reportName">) {
    return this.get({ ...request, reportName: "general_ledger" });
  }
}
