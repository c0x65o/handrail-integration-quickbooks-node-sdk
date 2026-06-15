import {
  optionalFlag,
  parseEntities,
  withoutUndefined
} from "./shared.js";
import { HandrailQuickBooksConfigError } from "../../errors.js";
import type { HandrailQuickBooksStartSyncRequest } from "../../types.js";
import type { CliCommandDefinition } from "../types.js";

export const syncCommand: CliCommandDefinition = {
  description: "Start a normalized QuickBooks sync job.",
  name: "sync",
  run: (context) => {
    const mode = optionalMode(context.flags);
    return context.client.syncJobs.start(
      withoutUndefined({
        entities: parseEntities(optionalFlag(context.flags, "entities")),
        importBatchId: optionalFlag(context.flags, "import-batch-id"),
        mode,
        since: optionalFlag(context.flags, "since")
      }),
      {
        idempotencyKey: optionalFlag(context.flags, "idempotency-key")
      }
    );
  },
  usage: "handrail-qbo sync --tenant-id tenant_123 --api-key <redacted> --mode incremental --entities accounts,ledger_entries"
};

function optionalMode(
  flags: ReadonlyMap<string, string | true>
): HandrailQuickBooksStartSyncRequest["mode"] {
  const value = optionalFlag(flags, "mode");
  if (value === undefined) {
    return undefined;
  }

  if (value !== "incremental" && value !== "full") {
    throw new HandrailQuickBooksConfigError("--mode must be incremental or full.");
  }

  return value;
}
