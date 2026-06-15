import {
  optionalFlag,
  withoutUndefined
} from "./shared.js";
import type { CliCommandDefinition } from "../types.js";

export const connectUrlCommand: CliCommandDefinition = {
  description: "Create a service-owned QuickBooks connect URL.",
  name: "connect-url",
  run: (context) => context.client.connections.connectUrl(withoutUndefined({
    connectionId: optionalFlag(context.flags, "connection-id"),
    returnUrl: optionalFlag(context.flags, "return-url"),
    state: optionalFlag(context.flags, "state")
  })),
  usage: "handrail-qbo connect-url --tenant-id tenant_123 --api-key <redacted> --return-url https://erp.example.test/settings/accounting"
};
