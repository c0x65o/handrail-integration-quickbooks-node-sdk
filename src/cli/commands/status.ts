import { withFutureErpConfigArtifact } from "../future-erp-config.js";
import type { CliCommandDefinition } from "../types.js";

export const statusCommand: CliCommandDefinition = {
  description: "Read tenant connection status.",
  name: "status",
  run: async (context) =>
    withFutureErpConfigArtifact(await context.client.connections.status(), context),
  usage:
    "HANDRAIL_QBO_SERVICE_ENV=staging HANDRAIL_QBO_PROVIDER_MODE=sandbox HANDRAIL_QBO_API_KEY=<redacted> handrail-qbo status --tenant-id tenant_123"
};

export const tokenStatusCommand: CliCommandDefinition = {
  description: "Read bounded token custody diagnostics without exposing token material.",
  name: "token-status",
  run: (context) => context.client.connections.tokenStatus(),
  usage: "handrail-qbo token-status --tenant-id tenant_123 --api-key <redacted>"
};
