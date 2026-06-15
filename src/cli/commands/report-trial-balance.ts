import {
  optionalFlag,
  requiredFlag,
  withoutUndefined
} from "./shared.js";
import { HandrailQuickBooksConfigError } from "../../errors.js";
import type { HandrailQuickBooksTrialBalanceRequest } from "../../types.js";
import type { CliCommandDefinition } from "../types.js";

export const reportTrialBalanceCommand: CliCommandDefinition = {
  aliases: ["report trial-balance"],
  description: "Run a trial-balance report through the integration service.",
  name: "report trial-balance",
  run: (context) => {
    const basis = optionalBasis(context.flags);
    return context.client.reports.trialBalance(withoutUndefined({
      accountingBasis: basis,
      asOfDate: optionalFlag(context.flags, "as-of") ?? requiredFlag(context.flags, "as-of-date"),
      currencyCode: optionalFlag(context.flags, "currency")
    }));
  },
  usage: "handrail-qbo report trial-balance --tenant-id tenant_123 --api-key <redacted> --as-of 2026-05-31"
};

function optionalBasis(
  flags: ReadonlyMap<string, string | true>
): HandrailQuickBooksTrialBalanceRequest["accountingBasis"] {
  const value = optionalFlag(flags, "basis") ?? optionalFlag(flags, "accounting-basis");
  if (value === undefined) {
    return undefined;
  }

  if (value !== "accrual" && value !== "cash") {
    throw new HandrailQuickBooksConfigError("--basis must be accrual or cash.");
  }

  return value;
}
