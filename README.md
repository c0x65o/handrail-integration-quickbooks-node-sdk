# Handrail QuickBooks Node SDK

Internal TypeScript package foundation for Handrail ERP-style apps that need to consume normalized QuickBooks data through the central Handrail QuickBooks integration service.

ERP apps must call the Handrail integration service at `https://quickbooks.handrail-daas.com`. They must not store Intuit OAuth tokens, refresh tokens, webhooks, or call Intuit/QuickBooks APIs directly. OAuth, token custody, webhooks, CDC/imports, normalized accounting data, sync jobs, and reconciliation remain owned by the central service.

## Install

This package is private and internal-first. Until Handrail publishes a registry package, consume it from the repo or a workspace reference:

```json
{
  "dependencies": {
    "@handrail/quickbooks-node-sdk": "workspace:*"
  }
}
```

## Cross-project Adoption Guide

ERP apps should treat this package as their only QuickBooks-facing dependency. The app boundary is:

1. The ERP app imports `@handrail/quickbooks-node-sdk` and configures it with Handrail runtime config.
2. The SDK calls the central Handrail QuickBooks integration service.
3. The central service owns Intuit OAuth, token custody, webhook handling, CDC/imports, normalized accounting data, sync jobs, reconciliation, and QuickBooks API calls.

ERP apps must not store Intuit access tokens, refresh tokens, OAuth client secrets, webhook secrets, or call Intuit/QuickBooks APIs directly. If an ERP app needs data not exposed here, add a stable integration-service contract and SDK method instead of bypassing the service.

Recommended adoption steps:

1. Add the package through a workspace reference or internal package source.
2. Configure `HANDRAIL_QBO_BASE_URL`, `HANDRAIL_QBO_API_KEY`, and `HANDRAIL_QBO_TENANT_ID` through Handrail runtime configuration for each environment.
3. Instantiate `HandrailQuickBooksClient` from server-side code only. Do not bundle service credentials into browser code.
4. Use stable business namespaces for application workflows and reserve `audit` fields for support/debug links.
5. Use the CLI locally or in operator shells for smoke tests with redacted runtime credentials.

For Handrail-managed deploys, these values should be provided as env/config rows and rendered into the service runtime by Handrail. Do not patch Kubernetes Secrets directly; a later deploy regenerates them from Handrail-owned configuration.

## Runtime Configuration

Configure the SDK explicitly in application code or through runtime env injected by Handrail:

| Env var | Purpose |
| --- | --- |
| `HANDRAIL_QBO_BASE_URL` | Optional service base URL. Defaults to `https://quickbooks.handrail-daas.com`. |
| `HANDRAIL_QBO_API_KEY` | Required for CLI smoke tests and expected for authenticated app calls. Service API key or bearer credential for the calling app. Do not commit real values. |
| `HANDRAIL_QBO_TENANT_ID` | Required for CLI smoke tests and recommended as the default Handrail tenant identifier for SDK calls. |

No Intuit credentials belong in this package or in ERP app repositories.
Provider environment and profile values, such as sandbox or production, are service-owned status metadata returned by diagnostics endpoints. They are not SDK constructor options, CLI flags, or ERP app credentials.

The CLI reads the same env vars, or the equivalent flags:

```sh
export HANDRAIL_QBO_BASE_URL="https://quickbooks.handrail-daas.com"
export HANDRAIL_QBO_TENANT_ID="tenant_123"
export HANDRAIL_QBO_API_KEY="<service credential from Handrail runtime config>"
```

Never commit real `HANDRAIL_QBO_API_KEY` values or Intuit token material.

Application code may also pass config explicitly when a host app resolves tenant/auth context per request:

```ts
const quickBooks = new HandrailQuickBooksClient({
  apiKey: request.serviceApiKey,
  baseUrl: process.env.HANDRAIL_QBO_BASE_URL,
  tenantId: request.tenantId,
  timeoutMs: 10_000
});
```

Keep `apiKey` and any custom `auth.token` values server-side. Logs, test fixtures, snapshots, and support tickets should redact those values.

## Usage

```ts
import { HandrailQuickBooksClient } from "@handrail/quickbooks-node-sdk";

const quickBooks = new HandrailQuickBooksClient({
  apiKey: process.env.HANDRAIL_QBO_API_KEY,
  baseUrl: process.env.HANDRAIL_QBO_BASE_URL,
  tenantId: "tenant_123"
});

const connection = await quickBooks.connections.status();
const connect = await quickBooks.connections.connectUrl({
  returnUrl: "https://erp.example.test/settings/accounting"
});
const sync = await quickBooks.syncJobs.start({
  entities: ["accounts", "ledger_entries"],
  mode: "incremental"
});
const trialBalance = await quickBooks.reports.trialBalance({
  asOfDate: "2026-05-31"
});
const ledgerEntries = await quickBooks.ledgerEntries.search({
  accountId: "acct_100",
  from: "2026-05-01",
  to: "2026-05-31"
});
```

The public surface exposes stable Handrail business concepts through resource modules:

- `connections.status()` and `connections.connectUrl()`
- `syncJobs.start()`, `syncJobs.get()`, and `syncJobs.list()`
- `rawImports.status()` and `rawImports.list()`
- `accounts.list()` and `accounts.get()`
- `parties.list()` and `parties.get()`
- `transactions.list()` and `transactions.get()`
- `ledgerEntries.search()` and `ledgerEntries.get()`
- `reports.trialBalance()`
- `reconciliation.run()`
- `drilldowns.get()`

The SDK keeps Intuit-specific details bounded to `audit` references such as `realmId`, QBO object IDs, source payload references, sync tokens, and import batches. Consumers should treat those fields as diagnostics, not as a direct QuickBooks API contract.

Stable namespaces are the SDK compatibility surface. Method names, request/response shapes, and normalized business identifiers should change only through versioned updates. Bounded audit fields may help support teams correlate central-service state with QuickBooks objects, but product workflows should not depend on raw Intuit payload structure.

## CLI

The package exposes a `handrail-qbo` CLI for developer smoke tests and operator workflows. It wraps `HandrailQuickBooksClient`; it does not call QuickBooks or Intuit directly.

```sh
handrail-qbo --help
handrail-qbo connect-url --tenant-id tenant_123 --api-key <redacted> --return-url https://erp.example.test/settings/accounting
handrail-qbo pull-accounts --tenant-id tenant_123 --api-key <redacted> --active --type asset
handrail-qbo sync --tenant-id tenant_123 --api-key <redacted> --mode incremental --entities accounts,ledger_entries
handrail-qbo report trial-balance --tenant-id tenant_123 --api-key <redacted> --as-of 2026-05-31 --basis accrual
handrail-qbo reconcile --tenant-id tenant_123 --api-key <redacted> --account-id acct_100 --start-date 2026-05-01 --end-date 2026-05-31 --ending-balance 1250.00
handrail-qbo status --tenant-id tenant_123 --api-key <redacted>
handrail-qbo token-status --tenant-id tenant_123 --api-key <redacted>
handrail-qbo raw-import-status --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123
```

Supported commands:

- `connect-url` creates a service-owned QuickBooks connect URL.
- `pull-accounts` reads normalized accounts, with optional `--active`, `--inactive`, `--type`, `--limit`, and `--cursor` filters.
- `sync` starts a sync job with optional `--mode`, `--entities`, `--since`, `--import-batch-id`, and `--idempotency-key`.
- `report trial-balance` requests a trial-balance report with `--as-of` or `--as-of-date`.
- `reconcile` runs reconciliation for an account and period.
- `status` reads tenant connection status.
- `status` may include sanitized service-owned provider metadata such as `providerEnvironment` and `providerProfile` when the integration service reports it.
- `token-status` reads bounded token custody diagnostics without exposing token values.
- `raw-import-status` reads one import batch with `--import-batch-id` or lists recent batches.

CLI errors print safe diagnostics only: message, code, HTTP status, request id, and retryability. They do not print API keys, Intuit tokens, or raw service error details.

## Local Smoke-test Flow

Use offline tests for normal development and reserve live smoke tests for environments with Handrail-provided service credentials.

1. Install dependencies in this package.
2. Run the offline unit tests when changing SDK or CLI behavior.
3. Export runtime config from a safe local shell or operator environment.
4. Verify connection status before running commands that start sync or reconciliation work.

```sh
npm install
npm run test

export HANDRAIL_QBO_BASE_URL="https://quickbooks.handrail-daas.com"
export HANDRAIL_QBO_TENANT_ID="tenant_123"
export HANDRAIL_QBO_API_KEY="<redacted service credential>"

handrail-qbo status
handrail-qbo token-status
handrail-qbo raw-import-status --import-batch-id batch_123
handrail-qbo pull-accounts --active --limit 25
handrail-qbo sync --mode incremental --entities accounts,ledger_entries
handrail-qbo report trial-balance --as-of 2026-05-31 --basis accrual
```

Safe diagnostics guidance:

- Prefer `status`, `token-status`, and `raw-import-status` for operator checks.
- Share `requestId`, command name, tenant id, job id, import batch id, and timestamps with support.
- Do not paste API keys, Intuit OAuth values, raw Authorization headers, webhook secrets, or full raw QuickBooks payloads into logs or tickets.
- Treat `realmId`, QBO object IDs, sync tokens, source payload refs, and import batch ids as bounded audit references, not reusable credentials.

## Request Behavior

`HandrailQuickBooksClient` sends requests to the Handrail integration service only. It supports:

- `baseUrl`, `tenantId`, `apiKey`, or explicit `auth` configuration.
- Per-client `timeoutMs`, defaulting to 10 seconds.
- Safe retries for idempotent reads. Mutating calls are not retried unless an idempotency key is supplied where supported.
- Structured `HandrailQuickBooksError` failures with `code`, `status`, `requestId`, `retryable`, and safe diagnostic `details`.

## Tests and Contract Examples

Unit tests are fully offline and use mocked fetch/SDK clients plus fixtures from `tests/fixtures/accounting.ts`. They do not require Intuit credentials, a QuickBooks tenant, or access to `https://quickbooks.handrail-daas.com`.

```sh
npm run test
```

Example service response contracts live in `examples/contracts/` for connection status, connect URL, account pulls, CDC sync start, trial balance, ledger search, and reconciliation. These examples include normalized Handrail accounting concepts and bounded audit/debug references only; they do not include token material or real credentials.

Later smoke tests against the integration service should use the CLI with Handrail-provided runtime config:

```sh
HANDRAIL_QBO_BASE_URL="https://quickbooks.handrail-daas.com" \
HANDRAIL_QBO_TENANT_ID="tenant_123" \
HANDRAIL_QBO_API_KEY="<redacted service credential>" \
handrail-qbo status
```

## Scripts

```sh
npm run lint
npm run test
npm run build
```

`npm run build` emits ESM JavaScript, source maps, and `.d.ts` files into `dist/`.

## Versioning Expectations

The package starts at `0.x` while the central service contract is still stabilizing. During this phase:

- Patch versions should be used for documentation, tests, fixtures, and bug fixes that do not change the consumer contract.
- Minor versions may add SDK namespaces, methods, optional request fields, optional response fields, or CLI commands.
- Breaking changes to method names, required config, required request fields, response semantics, or CLI command names should be coordinated with consuming ERP apps before adoption.
- Consumers should pin an exact workspace, commit, or internal package version for production services until Handrail publishes a stronger registry/release process.

## Future Hardening Path

Future work, after the central QuickBooks integration service API stabilizes, should move this package toward contract-generated hardening without making that part of the initial feature:

- Publish a canonical OpenAPI spec from the central service for normalized accounting, sync, reporting, reconciliation, drilldown, and diagnostics endpoints.
- Generate or verify SDK request/response types from that spec while keeping the current stable business namespaces as the ergonomic public API.
- Add contract tests that compare generated types, examples in `examples/contracts/`, and mocked SDK behavior against the service spec.
- Introduce an internal registry publishing flow with changelog, provenance, and semver release gates.
- Consider a public package release only after API stability, security review, credential-handling review, and support ownership are agreed.

This hardening path must not add direct Intuit OAuth, direct token storage, direct QuickBooks API calls, production credentials, or service deployment responsibilities to this SDK repo.

## Non-goals

- No public npm release yet.
- No OpenAPI-generated SDK contract yet.
- No direct Intuit SDK dependency.
- No direct Intuit OAuth or token storage.
- No direct Intuit or QuickBooks API calls from ERP apps, the SDK, or the CLI.
- No production credentials or checked-in secrets.
- No service deployment from this SDK repo.
