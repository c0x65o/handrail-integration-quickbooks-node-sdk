import type { CliCommandDefinition } from "../types.js";

export const statusCommand: CliCommandDefinition = {
  description: "Read tenant connection status.",
  name: "status",
  run: (context) => context.client.connections.status(),
  usage: "handrail-qbo status --tenant-id tenant_123 --api-key <redacted>"
};

export const tokenStatusCommand: CliCommandDefinition = {
  description: "Read bounded token custody diagnostics without exposing token material.",
  name: "token-status",
  run: (context) => context.client.connections.tokenStatus(),
  usage: "handrail-qbo token-status --tenant-id tenant_123 --api-key <redacted>"
};
