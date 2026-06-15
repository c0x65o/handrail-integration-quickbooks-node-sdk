import {
  listRequest,
  optionalFlag
} from "./shared.js";
import type { CliCommandDefinition } from "../types.js";

export const rawImportStatusCommand: CliCommandDefinition = {
  description: "Read raw import batch status.",
  name: "raw-import-status",
  run: (context) => {
    const importBatchId = optionalFlag(context.flags, "import-batch-id");
    if (importBatchId) {
      return context.client.rawImports.status(importBatchId);
    }

    return context.client.rawImports.list(listRequest(context.flags));
  },
  usage: "handrail-qbo raw-import-status --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123"
};
