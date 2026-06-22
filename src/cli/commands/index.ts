import { connectUrlCommand } from "./connect-url.js";
import { pullAccountsCommand } from "./pull-accounts.js";
import { rawImportStatusCommand } from "./raw-imports.js";
import { smokeCommand } from "./smoke.js";
import { statusCommand, tokenStatusCommand } from "./status.js";
import { syncCommand } from "./sync.js";
import type { CliCommandDefinition } from "../types.js";

export const commands: readonly CliCommandDefinition[] = [
  connectUrlCommand,
  pullAccountsCommand,
  syncCommand,
  smokeCommand,
  statusCommand,
  tokenStatusCommand,
  rawImportStatusCommand
];

const COMMAND_NAMES = new Set(commands.map((command) => command.name.split(" ")[0]));

export function resolveCommand(positionals: readonly string[]) {
  const twoPartName = positionals.slice(0, 2).join(" ");
  const twoPartCommand = commands.find((command) => command.name === twoPartName);
  if (twoPartCommand) {
    return {
      ...twoPartCommand,
      args: positionals.slice(2)
    };
  }

  const onePartName = positionals[0];
  const command = commands.find((candidate) => candidate.name === onePartName);
  if (!command) {
    return undefined;
  }

  return {
    ...command,
    args: positionals.slice(1)
  };
}

export function helpText(commandName?: string) {
  if (commandName) {
    const command = commands.find((candidate) => candidate.name === commandName);
    if (command) {
      return [
        command.usage,
        "",
        command.description
      ].join("\n");
    }
  }

  return [
    "handrail-qbo <command> [flags]",
    "",
    "Global flags:",
    "  --tenant-id <id>       Handrail tenant id. Env: HANDRAIL_QBO_TENANT_ID",
    "  --base-url <url>       Local service URL override. Env: HANDRAIL_QBO_BASE_URL",
    "  service env            Service URL selector env: HANDRAIL_QBO_SERVICE_ENV",
    "  --provider-mode <mode> Future ERP provider mode: sandbox or production. Env: HANDRAIL_QBO_PROVIDER_MODE",
    "  tenant map env         Future ERP tenant map: HANDRAIL_QBO_TENANT_MAP_JSON",
    "  --api-key <key>        Service API key/bearer credential. Env: HANDRAIL_QBO_API_KEY",
    "  --timeout-ms <ms>      Request timeout override.",
    "  --retries <count>      Safe retry count override.",
    "",
    "Commands:",
    ...commands.map((command) => `  ${command.name.padEnd(22)} ${command.description}`),
    "",
    "Examples:",
    "  handrail-qbo connect-url --tenant-id tenant_123 --api-key <redacted> --return-url https://erp.example.test/settings/accounting",
    "  handrail-qbo pull-accounts --tenant-id tenant_123 --api-key <redacted> --active --type asset",
    "  handrail-qbo sync --tenant-id tenant_123 --api-key <redacted> --mode incremental --entities accounts,ledger_entries",
    "  handrail-qbo smoke --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123",
    "  HANDRAIL_QBO_SERVICE_ENV=staging HANDRAIL_QBO_PROVIDER_MODE=sandbox handrail-qbo status --tenant-id tenant_123",
    "  handrail-qbo status --tenant-id tenant_123 --api-key <redacted>",
    "  handrail-qbo token-status --tenant-id tenant_123 --api-key <redacted>",
    "",
    `Command groups: ${Array.from(COMMAND_NAMES).join(", ")}`
  ].join("\n");
}
