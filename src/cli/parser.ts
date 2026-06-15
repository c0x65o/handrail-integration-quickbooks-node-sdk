import { HandrailQuickBooksConfigError } from "../errors.js";

export interface ParsedCliArgs {
  readonly flags: ReadonlyMap<string, string | true>;
  readonly help: boolean;
  readonly positionals: readonly string[];
}

export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
  const flags = new Map<string, string | true>();
  const positionals: string[] = [];
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }

    const flag = arg.slice(2);
    const equalsIndex = flag.indexOf("=");
    const rawKey = equalsIndex === -1 ? flag : flag.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : flag.slice(equalsIndex + 1);
    if (!rawKey) {
      throw new HandrailQuickBooksConfigError("Empty CLI flag is not supported.");
    }

    if (inlineValue !== undefined) {
      flags.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.set(rawKey, next);
      index += 1;
      continue;
    }

    flags.set(rawKey, true);
  }

  return {
    flags,
    help,
    positionals
  };
}
