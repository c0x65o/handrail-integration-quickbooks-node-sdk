import { HandrailQuickBooksConfigError } from "../../errors.js";
import type {
  HandrailQuickBooksEntityName,
  HandrailQuickBooksListRequest
} from "../../types.js";

const ENTITY_NAMES = new Set<HandrailQuickBooksEntityName>([
  "accounts",
  "parties",
  "transactions",
  "ledger_entries",
  "reports",
  "reconciliation",
  "drilldowns"
]);

export function optionalFlag(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = flags.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function requiredFlag(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = optionalFlag(flags, key);
  if (!value) {
    throw new HandrailQuickBooksConfigError(`Missing required flag --${key}.`);
  }
  return value;
}

export function optionalNumberFlag(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = optionalFlag(flags, key);
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new HandrailQuickBooksConfigError(`--${key} must be a number.`);
  }

  return parsed;
}

export function optionalBooleanFlag(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = flags.get(key);
  if (value === undefined) {
    return undefined;
  }

  if (value === true) {
    return true;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new HandrailQuickBooksConfigError(`--${key} must be true or false.`);
}

export function listRequest(flags: ReadonlyMap<string, string | true>): HandrailQuickBooksListRequest {
  return withoutUndefined({
    cursor: optionalFlag(flags, "cursor"),
    limit: optionalNumberFlag(flags, "limit")
  });
}

export function parseEntities(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const entities = value.split(",").map((entity) => entity.trim()).filter(Boolean);
  const invalid = entities.find((entity) => !ENTITY_NAMES.has(entity as HandrailQuickBooksEntityName));
  if (invalid) {
    throw new HandrailQuickBooksConfigError(`Unsupported entity in --entities: ${invalid}.`);
  }

  return entities as HandrailQuickBooksEntityName[];
}

export function withoutUndefined<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]: Exclude<T[K], undefined> };
}
