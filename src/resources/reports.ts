import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksAccountsPayableAgingReport,
  HandrailQuickBooksAccountsReceivableAgingReport,
  HandrailQuickBooksAgingReportRequest,
  HandrailQuickBooksBalanceSheetReport,
  HandrailQuickBooksBalanceSheetRequest,
  HandrailQuickBooksCashFlowReport,
  HandrailQuickBooksCashFlowRequest,
  HandrailQuickBooksGeneralLedgerReport,
  HandrailQuickBooksGeneralLedgerRequest,
  HandrailQuickBooksProfitAndLossReport,
  HandrailQuickBooksProfitAndLossRequest,
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

  profitAndLoss(request: HandrailQuickBooksProfitAndLossRequest) {
    return this.report<HandrailQuickBooksProfitAndLossReport>("profit-and-loss", request);
  }

  balanceSheet(request: HandrailQuickBooksBalanceSheetRequest) {
    return this.report<HandrailQuickBooksBalanceSheetReport>("balance-sheet", request);
  }

  cashFlow(request: HandrailQuickBooksCashFlowRequest) {
    return this.report<HandrailQuickBooksCashFlowReport>("cash-flow", request);
  }

  generalLedger(request: HandrailQuickBooksGeneralLedgerRequest) {
    return this.report<HandrailQuickBooksGeneralLedgerReport>("general-ledger", request);
  }

  accountsReceivableAging(request: HandrailQuickBooksAgingReportRequest) {
    return this.report<HandrailQuickBooksAccountsReceivableAgingReport>(
      "accounts-receivable-aging",
      request
    );
  }

  accountsPayableAging(request: HandrailQuickBooksAgingReportRequest) {
    return this.report<HandrailQuickBooksAccountsPayableAgingReport>(
      "accounts-payable-aging",
      request
    );
  }

  private report<TReport>(reportName: string, request: unknown) {
    return this.http.request<TReport>(
      this.accountingTenantPath(`reports/${encodeURIComponent(reportName)}`),
      {
        body: request,
        method: "POST"
      }
    );
  }
}
