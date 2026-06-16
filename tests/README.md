# SDK Contract Path Notes

The QuickBooks service checkout used for this SDK update did not contain concrete routes for the additional normalized report methods yet. The SDK contract tests therefore pin the assumed normalized accounting path convention:

- `POST /v1/tenants/:tenantId/accounting/reports/profit-and-loss`
- `POST /v1/tenants/:tenantId/accounting/reports/balance-sheet`
- `POST /v1/tenants/:tenantId/accounting/reports/cash-flow`
- `POST /v1/tenants/:tenantId/accounting/reports/general-ledger`
- `POST /v1/tenants/:tenantId/accounting/reports/accounts-receivable-aging`
- `POST /v1/tenants/:tenantId/accounting/reports/accounts-payable-aging`

The existing `reports.trialBalance()` method keeps its current `quickbooks/reports/trial-balance` path to avoid a breaking SDK change. Drilldowns keep the existing generic `quickbooks/drilldowns/:type/:id` path.
