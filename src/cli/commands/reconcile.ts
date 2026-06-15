import {
  optionalFlag,
  requiredFlag
} from "./shared.js";
import type { CliCommandDefinition } from "../types.js";

export const reconcileCommand: CliCommandDefinition = {
  description: "Run account reconciliation through the integration service.",
  name: "reconcile",
  run: (context) => context.client.reconciliation.run(
    {
      accountId: requiredFlag(context.flags, "account-id"),
      endingBalance: requiredFlag(context.flags, "ending-balance"),
      period: {
        endDate: requiredFlag(context.flags, "end-date"),
        startDate: requiredFlag(context.flags, "start-date")
      }
    },
    {
      idempotencyKey: optionalFlag(context.flags, "idempotency-key")
    }
  ),
  usage: "handrail-qbo reconcile --tenant-id tenant_123 --api-key <redacted> --account-id acct_100 --start-date 2026-05-01 --end-date 2026-05-31 --ending-balance 1250.00"
};
