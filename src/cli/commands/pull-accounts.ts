import {
  listRequest,
  optionalBooleanFlag,
  optionalFlag,
  withoutUndefined
} from "./shared.js";
import { HandrailQuickBooksConfigError } from "../../errors.js";
import type { HandrailQuickBooksAccountType } from "../../types.js";
import type { CliCommandDefinition } from "../types.js";

const ACCOUNT_TYPES = new Set<HandrailQuickBooksAccountType>([
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
  "other"
]);

export const pullAccountsCommand: CliCommandDefinition = {
  description: "Pull normalized accounts from the integration service.",
  name: "pull-accounts",
  run: (context) => {
    const type = optionalAccountType(context.flags);
    return context.client.accounts.list(withoutUndefined({
      ...listRequest(context.flags),
      isActive: resolveIsActive(context.flags),
      type
    }));
  },
  usage: "handrail-qbo pull-accounts --tenant-id tenant_123 --api-key <redacted> --active --type asset"
};

function optionalAccountType(flags: ReadonlyMap<string, string | true>) {
  const value = optionalFlag(flags, "type");
  if (value === undefined) {
    return undefined;
  }

  if (!ACCOUNT_TYPES.has(value as HandrailQuickBooksAccountType)) {
    throw new HandrailQuickBooksConfigError(`Unsupported account --type: ${value}.`);
  }

  return value as HandrailQuickBooksAccountType;
}

function resolveIsActive(flags: ReadonlyMap<string, string | true>) {
  if (flags.has("active")) {
    return true;
  }

  if (flags.has("inactive")) {
    return false;
  }

  return optionalBooleanFlag(flags, "is-active");
}
