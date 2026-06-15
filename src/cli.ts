import { HandrailQuickBooksClient } from "./client.js";
import {
  HandrailQuickBooksConfigError,
  HandrailQuickBooksError
} from "./errors.js";
import { HANDRAIL_QUICKBOOKS_ENV_KEYS } from "./runtime.js";
import { commands, helpText, resolveCommand } from "./cli/commands/index.js";
import { parseCliArgs } from "./cli/parser.js";
import type {
  CliCommandContext,
  CliGlobalConfig,
  CliOutput,
  CliQuickBooksClient
} from "./cli/types.js";

export interface RunCliOptions {
  readonly createClient?: (config: CliGlobalConfig) => CliQuickBooksClient;
  readonly env?: NodeJS.ProcessEnv;
  readonly stderr?: CliOutput;
  readonly stdout?: CliOutput;
}

export async function runCli(argv: readonly string[], options: RunCliOptions = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const env = options.env ?? process.env;

  try {
    const parsed = parseCliArgs(argv);

    if (parsed.help || parsed.positionals.length === 0) {
      stdout.write(`${helpText()}\n`);
      return 0;
    }

    const command = resolveCommand(parsed.positionals);
    if (!command) {
      stderr.write(
        `Unknown command: ${parsed.positionals.join(" ")}\n\n${helpText()}\n`
      );
      return 2;
    }

    if (command.help) {
      stdout.write(`${helpText(command.name)}\n`);
      return 0;
    }

    const config = resolveGlobalConfig(parsed.flags, env);
    const missing = missingRequiredConfig(config);
    if (missing.length > 0) {
      stderr.write(
        `Missing required configuration: ${missing.join(", ")}.\n` +
          "Provide values with flags or env: --tenant-id/HANDRAIL_QBO_TENANT_ID, " +
          "--api-key/HANDRAIL_QBO_API_KEY.\n"
      );
      return 2;
    }

    const client =
      options.createClient?.(config) ??
      new HandrailQuickBooksClient({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        retries: config.retries,
        tenantId: config.tenantId,
        timeoutMs: config.timeoutMs
      });
    const context: CliCommandContext = {
      client,
      config,
      flags: parsed.flags,
      positionals: command.args,
      stderr,
      stdout
    };

    const result = await command.run(context);
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    stderr.write(`${formatCliError(error)}\n`);
    return error instanceof HandrailQuickBooksConfigError ? 2 : 1;
  }
}

function resolveGlobalConfig(
  flags: ReadonlyMap<string, string | true>,
  env: NodeJS.ProcessEnv
): CliGlobalConfig {
  return {
    apiKey: flagValue(flags, "api-key") ?? env[HANDRAIL_QUICKBOOKS_ENV_KEYS.apiKey],
    baseUrl: flagValue(flags, "base-url") ?? env[HANDRAIL_QUICKBOOKS_ENV_KEYS.baseUrl],
    retries: optionalNumber(flags, "retries"),
    tenantId:
      flagValue(flags, "tenant-id") ??
      flagValue(flags, "tenant") ??
      env[HANDRAIL_QUICKBOOKS_ENV_KEYS.tenantId],
    timeoutMs: optionalNumber(flags, "timeout-ms")
  };
}

function missingRequiredConfig(config: CliGlobalConfig) {
  const missing: string[] = [];
  if (!config.tenantId) {
    missing.push("tenantId");
  }
  if (!config.apiKey) {
    missing.push("apiKey");
  }
  return missing;
}

function flagValue(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = flags.get(key);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(flags: ReadonlyMap<string, string | true>, key: string) {
  const value = flagValue(flags, key);
  if (value === undefined) {
    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new HandrailQuickBooksConfigError(`--${key} must be a number.`);
  }

  return number;
}

function formatCliError(error: unknown) {
  if (error instanceof HandrailQuickBooksError) {
    const parts = [
      error.message,
      error.code ? `code=${error.code}` : undefined,
      error.status ? `status=${error.status}` : undefined,
      error.requestId ? `requestId=${error.requestId}` : undefined,
      error.retryable ? "retryable=true" : undefined
    ].filter((part): part is string => Boolean(part));
    return parts.join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Handrail QuickBooks CLI failed.";
}

export { commands };
