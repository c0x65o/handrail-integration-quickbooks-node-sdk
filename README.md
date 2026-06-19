# Handrail QuickBooks Node SDK

Internal TypeScript package foundation for Handrail ERP-style apps that need to consume normalized QuickBooks data through the central Handrail QuickBooks integration service.

ERP apps must call the Handrail integration service through the service URL resolved from
`HANDRAIL_QBO_SERVICE_ENV`. The staging host is
`https://quickbooks.hitcents.staging.handrail-daas.com`; the production host is
`https://quickbooks.handrail-daas.com`.
They must not store Intuit OAuth tokens, refresh tokens, webhooks, or call Intuit/QuickBooks
APIs directly. OAuth, token custody, webhooks, CDC/imports, normalized accounting data,
sync jobs, and reconciliation remain owned by the central service.

Service ownership and the Future ERP tenant-mapping contract are documented in the sibling service repo:
[QuickBooks Production Integration](../handrail-integration-quickbooks/docs/quickbooks-production.md#service-responsibility)
and [Future ERP QuickBooks Tenant Mapping Contract](../handrail-integration-quickbooks/docs/future-erp-tenant-mapping-contract.md).

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

This SDK repo owns only reusable consumer code: runtime config helpers, TypeScript request and
response types, CLI smoke/status helpers, tenant-map resolution support, and HTTP calls to the
Handrail QuickBooks service API. It must not own service deployment, Intuit app credentials,
Intuit token custody, owner/admin tenant administration, API-key issuance, or direct
Intuit/QuickBooks API calls.

Hitcents Future ERP is the current consumer project. Future ERP owns only server-side storage
and validation of its account/company-to-service-tenant mapping plus server-only use of this SDK
and runtime config. Future ERP must not store Intuit tokens or call Intuit/QuickBooks APIs
directly.

Recommended adoption steps:

1. Add the package through a workspace reference or internal package source.
2. Configure `HANDRAIL_QBO_SERVICE_ENV`, `HANDRAIL_QBO_PROVIDER_MODE`,
   `HANDRAIL_QBO_API_KEY`, and the server-only tenant map through Handrail runtime
   configuration for each environment.
3. Resolve the selected Future ERP account/company to a QuickBooks service tenant id from the
   tenant map before making SDK calls.
4. Instantiate `HandrailQuickBooksClient` from server-side code only. Do not bundle service
   credentials or tenant-map payloads into browser code.
5. Use stable business namespaces for application workflows and reserve `audit` fields for support/debug links.
6. Use the CLI locally or in operator shells for smoke/status tests with redacted runtime credentials.

For Handrail-managed deploys, these values should be provided as env/config rows and rendered
into the consuming app runtime by Handrail. Do not patch Kubernetes Secrets directly; a later
deploy regenerates them from Handrail-owned configuration.

## Runtime Configuration

Configure the SDK explicitly in application code or through runtime env injected by Handrail:

| Env var | Purpose |
| --- | --- |
| `HANDRAIL_QBO_SERVICE_ENV` | Standard Future ERP runtime selector for the QuickBooks service environment: `dev`, `staging`, or `production`. SDK runtime config support belongs in this repo and should derive the service base URL from this value. |
| `HANDRAIL_QBO_PROVIDER_MODE` | Standard Future ERP runtime selector for the Intuit provider mode: `sandbox` or `production`. SDK calls and status helpers should preserve this value where the service contract requires provider-mode context. |
| `HANDRAIL_QBO_API_KEY` | Required server-only service API key or bearer credential issued by the QuickBooks Integration service. Do not commit real values or expose them to browser code. |
| `HANDRAIL_QBO_TENANT_MAP_JSON` | Required server-only Future ERP mapping artifact for account/company-to-service-tenant resolution. The artifact shape is defined by `future-erp.quickbooks-tenant-mapping.v1` in the service repo. |
| `HANDRAIL_QBO_BASE_URL` | Local developer override only, for pointing at a manually started service. Normal Future ERP runtime config must not require this value. |
| `HANDRAIL_QBO_TENANT_ID` | Local CLI/operator convenience only when targeting one known service tenant explicitly. Future ERP must not use this as the standard mapping model. |

Current SDK-owned service-env URL resolution:

| Service env | Service base URL |
| --- | --- |
| `dev` | `https://quickbooks.hitcents.staging.handrail-daas.com` |
| `staging` | `https://quickbooks.hitcents.staging.handrail-daas.com` |
| `production` | `https://quickbooks.handrail-daas.com` |

Local development may still pass an explicit `baseUrl` option or use the CLI/local
`HANDRAIL_QBO_BASE_URL` override when pointing at a manually started service.

No Intuit credentials belong in this package or in ERP app repositories.
Provider credentials and profile secrets stay service-owned. `HANDRAIL_QBO_PROVIDER_MODE` is
consumer configuration and status context, not an Intuit credential.

The CLI reads the same env vars, or the equivalent flags:

```sh
export HANDRAIL_QBO_SERVICE_ENV="staging"
export HANDRAIL_QBO_PROVIDER_MODE="sandbox"
export HANDRAIL_QBO_API_KEY="REDACTED_QBO_SERVICE_API_KEY"
export HANDRAIL_QBO_TENANT_MAP_JSON='{"schemaVersion":1,"contractId":"future-erp.quickbooks-tenant-mapping.v1","consumerProject":"Hitcents Future ERP","sourceOfTruth":"Handrail QuickBooks Integration service","serviceEnv":"staging","providerMode":"sandbox","tenantMappings":[{"futureErpAccountId":"acct_REDACTED_ALPHA","futureErpCompanyId":"company_REDACTED_ALPHA","serviceTenantId":"future-erp-dev-sandbox-tenant","displayName":"REDACTED Future ERP Sandbox Company","status":"active"}]}'
```

Never commit real `HANDRAIL_QBO_API_KEY` values, full tenant-map payloads, or Intuit token material.
Do not print API keys or full tenant-map payloads in logs, screenshots, browser-visible config,
analytics, or support tickets.

Application code may also pass config explicitly when a host app resolves tenant/auth context per request:

```ts
const tenantMap = JSON.parse(process.env.HANDRAIL_QBO_TENANT_MAP_JSON ?? "{}");
const serviceTenantId = resolveServiceTenantIdFromFutureErpContext(tenantMap, {
  futureErpAccountId: request.accountId,
  futureErpCompanyId: request.companyId
});
const providerMode = tenantMap.providerMode === "production" ? "production" : "sandbox";

const quickBooks = new HandrailQuickBooksClient({
  apiKey: process.env.HANDRAIL_QBO_API_KEY,
  providerMode,
  tenantId: serviceTenantId,
  timeoutMs: 10_000
});
```

`resolveServiceTenantIdFromFutureErpContext` represents the host app or SDK tenant-map resolver.
The resolved value is a QuickBooks service tenant id, not an Intuit `realmId`. Keep `apiKey`,
tenant-map payloads, and any custom `auth.token` values server-side. Logs, test fixtures,
snapshots, and support tickets should redact those values.

## Usage

```ts
import { HandrailQuickBooksClient } from "@handrail/quickbooks-node-sdk";

const quickBooks = new HandrailQuickBooksClient({
  apiKey: process.env.HANDRAIL_QBO_API_KEY,
  providerMode: "sandbox",
  tenantId: "future-erp-dev-sandbox-tenant"
});

const connection = await quickBooks.connections.status();
const connect = await quickBooks.connections.connectUrl({
  returnUrl: "https://erp.example.test/settings/accounting"
});
const sync = await quickBooks.syncJobs.start({
  entities: ["accounts", "items", "classes", "locations", "ledger_entries"],
  mode: "incremental"
});
const trialBalance = await quickBooks.reports.trialBalance({
  asOfDate: "2026-05-31"
});
const profitAndLoss = await quickBooks.reports.profitAndLoss({
  accountingBasis: "accrual",
  currencyCode: "USD",
  period: {
    startDate: "2026-05-01",
    endDate: "2026-05-31"
  }
});
const balanceSheet = await quickBooks.reports.balanceSheet({
  accountingBasis: "accrual",
  asOfDate: "2026-05-31",
  currencyCode: "USD"
});
const ledgerEntries = await quickBooks.ledgerEntries.search({
  accountId: "100",
  from: "2026-05-01",
  to: "2026-05-31"
});
const items = await quickBooks.items.list({ active: true });
const classes = await quickBooks.classes.list({ active: true });
const locations = await quickBooks.locations.list({ active: true });
const drilldown = await quickBooks.drilldowns.get({
  type: "report_line",
  id: "report-line-profit-and-loss-income"
});
const checkpoint = await quickBooks.checkpoints.get("quickbooks_incremental_accounts_Account");
```

The public surface exposes stable Handrail business concepts through resource modules:

- `connections.status()`, `connections.tokenStatus()`, and `connections.connectUrl()`
- `syncJobs.start()`, `syncJobs.get()`, and `syncJobs.list()`
- `rawImports.status()` and `rawImports.list()`
- `importBatches.get()` and `importBatches.list()`
- `checkpoints.get()` and `checkpoints.list()`
- `accounts.list()` and `accounts.get()`
- `items.list()` and `items.get()`
- `classes.list()` and `classes.get()`
- `locations.list()` and `locations.get()`
- `parties.list()` and `parties.get()`
- `transactions.list()` and `transactions.get()`
- `ledgerEntries.search()` and `ledgerEntries.get()`
- `reports.trialBalance()`
- `reports.profitAndLoss()`
- `reports.balanceSheet()`
- `reports.cashFlow()`
- `reports.generalLedger()`
- `reports.accountsReceivableAging()`
- `reports.accountsPayableAging()`
- `reconciliation.run()`
- `drilldowns.get()`

The SDK keeps Intuit-specific details bounded to safe metadata such as `realmId`, QBO object IDs, source refs, checkpoint refs, sync tokens, and import batches. Report, reconciliation, and drilldown responses expose first-class `reportSnapshotId`, `reportSnapshotRef`, `sourceRefs`, and `checkpointRefs` fields so ERP reconciliation views do not need to parse `audit.sourcePayloadRefs`. Consumers should treat `audit` fields as diagnostics, not as a direct QuickBooks API contract.

Object pulls and normalized report contracts use the integration service's normalized accounting API:
`/v1/tenants/:tenantId/accounting/accounts`, `/accounting/items`,
`/accounting/classes`, `/accounting/locations`, `/accounting/parties`,
`/accounting/transactions`, `/accounting/ledger-entries/search`, and
`/accounting/reports/{report-name}`. The SDK and CLI return
paginated `{ data, page }` responses unchanged, including optional filters such as `limit` and
`cursor` where supported. Reports expose normalized statement rows, totals, aging buckets, ledger
rows, first-class report snapshot refs, source refs, checkpoint refs, and drilldown references;
reconciliation and drilldowns remain operation/report surfaces, not raw-import object types.

Products are normalized from the QuickBooks Accounting API `Item` object. Locations are normalized
from the QuickBooks `Department` object with `locationSource: "department"` and
`locationObjectStatus: "mapped_to_department"`; the SDK does not invent a distinct QuickBooks
`Location` object contract.

Raw import and sync job responses expose first-class status metadata for initial loads and delta syncs. `syncMode` is `full` for initial load work and `incremental` for checkpoint-resumed CDC/query work; `syncPhase` is `initial_load` or `delta_sync`. `importVolume` repeats the service-normalized object/entity totals, errors, and warnings directly on `rawImports` and `syncJobs`, while `checkpoint` includes the checkpoint id/ref/kind, sync mode, provider-updated-at watermark, cursor refs, job refs, timestamps, status, and bounded audit refs. These fields are safe SDK contract fields and must not contain raw QuickBooks payloads.

Raw import and sync job responses may include a `retry` object with `retryable`, `attemptCount`, `maxAttempts`, optional `nextRetryAt`, `lastErrorCode`, and `retryReason`. These fields describe central-service retry readiness only; they use service-owned codes and must not contain Intuit tokens, Authorization headers, raw provider errors, or raw QuickBooks payloads.

Stable namespaces are the SDK compatibility surface. Method names, request/response shapes, normalized business identifiers, report snapshot refs, source refs, checkpoint refs, and bounded drilldown metadata should change only through versioned updates. Bounded audit fields may help support teams correlate central-service state with QuickBooks objects, but product workflows should not depend on raw Intuit payload structure.

## CLI

The package exposes a `handrail-qbo` CLI for developer smoke tests and operator workflows. It wraps `HandrailQuickBooksClient`; it does not call QuickBooks or Intuit directly.

```sh
handrail-qbo --help
handrail-qbo connect-url --tenant-id tenant_123 --api-key <redacted> --return-url https://erp.example.test/settings/accounting
handrail-qbo pull-accounts --tenant-id tenant_123 --api-key <redacted> --active --type asset
handrail-qbo sync --tenant-id tenant_123 --api-key <redacted> --mode incremental --entities accounts,ledger_entries
handrail-qbo report trial-balance --tenant-id tenant_123 --api-key <redacted> --as-of 2026-05-31 --basis accrual
handrail-qbo smoke --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123 --as-of 2026-05-31 --period-start 2026-05-01 --period-end 2026-05-31 --basis accrual --currency USD
handrail-qbo reconcile --tenant-id tenant_123 --api-key <redacted> --account-id acct_100 --start-date 2026-05-01 --end-date 2026-05-31 --ending-balance 1250.00
handrail-qbo status --tenant-id tenant_123 --api-key <redacted>
handrail-qbo token-status --tenant-id tenant_123 --api-key <redacted>
handrail-qbo raw-import-status --tenant-id tenant_123 --api-key <redacted> --import-batch-id batch_123
```

Supported commands:

- `connect-url` creates a service-owned QuickBooks connect URL.
- `pull-accounts` reads normalized accounts from `/v1/tenants/:tenantId/accounting/accounts`, with optional `--active`, `--inactive`, `--type`, `--limit`, and `--cursor` filters.
- `sync` starts a sync job with optional `--mode`, `--entities`, `--since`, `--import-batch-id`, and `--idempotency-key`.
- `report trial-balance` requests a trial-balance report with `--as-of` or `--as-of-date`.
- `smoke` prints a redacted operator JSON summary for connection/provider status, token custody state, raw import and sync job metadata, import volume, normalized account/item/class/location/party/transaction/ledger-entry counts, checkpoint position, and report availability.
- `reconcile` runs reconciliation for an account and period.
- `status` reads tenant connection status.
- `status` may include sanitized service-owned provider metadata such as `providerMode`, `providerEnvironment`, and `providerProfile` when the integration service reports it.
- `token-status` reads bounded token custody diagnostics without exposing token values.
- `raw-import-status` reads one import batch with `--import-batch-id` or lists recent batches.

Successful CLI commands print JSON. `status` and `smoke` append a `futureErpConfig`
artifact with copyable, redacted `HANDRAIL_QBO_SERVICE_ENV`,
`HANDRAIL_QBO_PROVIDER_MODE`, `HANDRAIL_QBO_API_KEY`, and
`HANDRAIL_QBO_TENANT_MAP_JSON` values for owner/operator handoff. If
`HANDRAIL_QBO_BASE_URL` or `--base-url` is present, it is reported only in
`localOverrideDiagnostics` as a local operator override and is excluded from
the copyable Future ERP config block. Most other commands return the SDK method
value directly. `smoke` intentionally reshapes successful SDK responses into bounded operator evidence: status values, ids, timestamps, import volume/object/entity counts, normalized resource counts, checkpoint id/ref/kind/watermark/cursor refs, and report availability counts. It omits audit payload references except bounded checkpoint cursor refs and does not print raw resource rows. Use `--import-batch-id`, `--sync-job-id`, and `--checkpoint-id` for deterministic probes; use `--as-of`/`--as-of-date`, `--period-start`, `--period-end`, `--basis`, `--currency`, `--limit`, `--bucket-days`, `--account-id`, `--party-id`, and `--transaction-id` to constrain report and count probes. Add `--skip-report-probes` or `--report-probes false` when only status/import/checkpoint evidence is needed.

For `status`, `token-status`, and `raw-import-status`, JSON is the service-owned diagnostics contract and may include bounded audit references such as `realmId`, `sourcePayloadRef`, `sourcePayloadRefs`, `connectionId`, `importBatchId`, checkpoint refs, checkpoint watermarks, import volume counts, and safe retry metadata for failed raw imports or sync jobs. CLI output must not include Intuit access tokens, refresh tokens, OAuth client secrets, raw Authorization headers, API keys, raw provider error payloads, or full raw QuickBooks payloads.

CLI errors print safe diagnostics only: message, code, HTTP status, request id, and retryability. They do not print API keys, Intuit tokens, or raw service error details.

## Local Smoke-test Flow

Use offline tests for normal development and reserve live smoke tests for environments with
Handrail-provided service credentials and a server-only tenant map.

1. Install dependencies in this package.
2. Run the offline unit tests when changing SDK or CLI behavior.
3. Export runtime config from a safe local shell or operator environment.
4. Resolve the service tenant id from the tenant map for the Future ERP account/company under test.
5. Verify connection status before running commands that start sync or reconciliation work.

```sh
npm install
npm run test

export HANDRAIL_QBO_SERVICE_ENV="staging"
export HANDRAIL_QBO_PROVIDER_MODE="sandbox"
export HANDRAIL_QBO_API_KEY="REDACTED_QBO_SERVICE_API_KEY"
export HANDRAIL_QBO_TENANT_MAP_JSON='{"schemaVersion":1,"contractId":"future-erp.quickbooks-tenant-mapping.v1","consumerProject":"Hitcents Future ERP","sourceOfTruth":"Handrail QuickBooks Integration service","serviceEnv":"staging","providerMode":"sandbox","tenantMappings":[{"futureErpAccountId":"acct_REDACTED_ALPHA","futureErpCompanyId":"company_REDACTED_ALPHA","serviceTenantId":"future-erp-dev-sandbox-tenant","displayName":"REDACTED Future ERP Sandbox Company","status":"active"}]}'

SERVICE_TENANT_ID="future-erp-dev-sandbox-tenant" # resolved from HANDRAIL_QBO_TENANT_MAP_JSON

handrail-qbo status --tenant-id "$SERVICE_TENANT_ID"
handrail-qbo token-status --tenant-id "$SERVICE_TENANT_ID"
handrail-qbo raw-import-status --tenant-id "$SERVICE_TENANT_ID" --import-batch-id batch_123
handrail-qbo smoke --tenant-id "$SERVICE_TENANT_ID" --import-batch-id batch_123 --as-of 2026-05-31 --period-start 2026-05-01 --period-end 2026-05-31 --basis accrual --currency USD
handrail-qbo pull-accounts --tenant-id "$SERVICE_TENANT_ID" --active --limit 25
handrail-qbo sync --tenant-id "$SERVICE_TENANT_ID" --mode incremental --entities accounts,ledger_entries
handrail-qbo report trial-balance --tenant-id "$SERVICE_TENANT_ID" --as-of 2026-05-31 --basis accrual
```

Safe diagnostics guidance:

- Prefer `status`, `token-status`, and `raw-import-status` for operator checks.
- Prefer `smoke` when support needs one bounded JSON summary that proves connection, token custody, import volume, normalized counts, checkpoint position, and report endpoint availability.
- Share `requestId`, command name, tenant id, job id, import batch id, and timestamps with support.
- Do not paste API keys, full tenant-map payloads, Intuit OAuth values, raw Authorization headers,
  webhook secrets, or full raw QuickBooks payloads into logs or tickets.
- Treat `realmId`, QBO object IDs, sync tokens, source payload refs, and import batch ids as bounded audit references, not reusable credentials.

## Request Behavior

`HandrailQuickBooksClient` sends requests to the Handrail integration service only. It supports:

- Runtime config derived from `HANDRAIL_QBO_SERVICE_ENV`, `HANDRAIL_QBO_PROVIDER_MODE`,
  `HANDRAIL_QBO_API_KEY`, and server-only tenant mapping as the Future ERP contract evolves.
- Local-only `baseUrl` overrides, explicit `tenantId` targeting, `apiKey`, or explicit `auth`
  configuration for developer/operator smoke paths.
- Per-client `timeoutMs`, defaulting to 10 seconds.
- Safe retries for idempotent reads. Mutating calls are not retried unless an idempotency key is supplied where supported.
- Structured `HandrailQuickBooksError` failures with `code`, `status`, `requestId`, `retryable`, and safe diagnostic `details`.

## Tests and Contract Examples

Unit tests are fully offline and use mocked fetch/SDK clients plus fixtures from `tests/fixtures/accounting.ts`. They do not require Intuit credentials, a QuickBooks tenant, or access to `https://quickbooks.handrail-daas.com`.

```sh
npm run test
```

Example service response contracts live in `examples/contracts/` for connection status, token status, raw import status, connect URL, normalized accounting resources, CDC sync start, import batches, checkpoints, trial balance, profit and loss, balance sheet, cash flow, general ledger, A/R aging, A/P aging, ledger search, reconciliation, and drilldowns. The report, reconciliation, and drilldown examples pin `reportSnapshotId`, `reportSnapshotRef`, `sourceRefs`, and `checkpointRefs` as the Future ERP compatibility surface. The transaction and ledger examples include sandbox-backed Bill, Payment, and Deposit contracts; no-data transaction objects remain visible through zero object counts in import metadata. The raw import example demonstrates `syncMode: "full"` / `syncPhase: "initial_load"` metadata, and the CDC sync start example demonstrates `syncMode: "incremental"` / `syncPhase: "delta_sync"` metadata. The `*.response.json` files describe the successful SDK return value and successful CLI stdout shape for those commands; the CLI does not wrap or reshape successful responses. These examples include normalized Handrail accounting concepts and bounded audit/debug references only; they do not include token material, real credentials, raw provider payloads, or direct Intuit API contracts.

Later smoke tests against the integration service should use the CLI with Handrail-provided runtime config:

```sh
HANDRAIL_QBO_SERVICE_ENV="staging" \
HANDRAIL_QBO_PROVIDER_MODE="sandbox" \
HANDRAIL_QBO_API_KEY="REDACTED_QBO_SERVICE_API_KEY" \
handrail-qbo status --tenant-id "future-erp-dev-sandbox-tenant"
```

## Scripts

```sh
npm run lint
npm run test
npm run build
```

`npm run build` emits ESM JavaScript, source maps, and `.d.ts` files into `dist/`.

## Future ERP Type Handoff

Future ERP should import SDK runtime and contract types from the package root:

```ts
import { HandrailQuickBooksClient } from "@handrail/quickbooks-node-sdk";
import type {
  HandrailQuickBooksSdkConfigInput,
  HandrailQuickBooksConnectionStatusResponse,
  HandrailQuickBooksSyncJobSummary,
  HandrailQuickBooksSyncCheckpoint,
  HandrailQuickBooksImportBatchSummary,
  HandrailQuickBooksAccount,
  HandrailQuickBooksParty,
  HandrailQuickBooksTransaction,
  HandrailQuickBooksLedgerEntry,
  HandrailQuickBooksReportRequest,
  HandrailQuickBooksReportResponse,
  HandrailQuickBooksReportName,
  HandrailQuickBooksAuditReference,
  HandrailQuickBooksReportDrilldownReference
} from "@handrail/quickbooks-node-sdk";
```

The package root is `dist/index.js`, and TypeScript resolves declarations through
`package.json` `types` and `exports["."].types` at `dist/index.d.ts`. The declaration bundle
re-exports public contract names from `dist/types.d.ts` plus resource request types from
`dist/resources/*.d.ts`. `npm run check:consumer-types` builds the package and verifies a
Future ERP-style consumer can import the public contract through `@handrail/quickbooks-node-sdk`
without depending on the old ambient `src/server/quickbooks/quickbooks-node-sdk.d.ts` fallback.

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
