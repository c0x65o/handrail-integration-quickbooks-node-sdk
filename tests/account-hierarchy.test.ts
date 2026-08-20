import { describe, expect, it } from "vitest";

import {
  HandrailQuickBooksAccountHierarchyError,
  normalizeQuickBooksAccountHierarchy,
  normalizeQuickBooksAccountResources,
  toNormalizedQuickBooksFullSyncResponseEnvelope,
  toNormalizedQuickBooksIncrementalSyncResponseEnvelope,
  type HandrailQuickBooksAccount,
  type HandrailQuickBooksSyncJobSummary
} from "../src/index.js";
import { contractResponses } from "./fixtures/accounting.js";

describe("QuickBooks account hierarchy contract", () => {
  it("normalizes parentRef.value into the stable parentAccountId", () => {
    expect(normalizeQuickBooksAccountHierarchy(account({
      parentRef: { value: " parent_1 ", name: "Software as a Service" },
      subAccount: true
    }))).toMatchObject({
      parentAccountId: "parent_1",
      parentRef: { value: "parent_1", name: "Software as a Service" },
      subAccount: true
    });
  });

  it("normalizes the parentAccountId fallback into parentRef", () => {
    expect(normalizeQuickBooksAccountHierarchy(account({
      parentAccountId: " parent_1 ",
      parentAccountName: "Software as a Service"
    }))).toMatchObject({
      parentAccountId: "parent_1",
      parentRef: { value: "parent_1", name: "Software as a Service" },
      subAccount: true
    });
  });

  it("does not infer hierarchy from names, paths, or FullyQualifiedName", () => {
    const input = account({
      fullyQualifiedName: "Software as a Service:EDR",
      hierarchyLevel: 1,
      hierarchyPath: ["Software as a Service", "EDR"],
      name: "  EDR"
    });

    expect(normalizeQuickBooksAccountHierarchy(input)).toBe(input);
    expect(normalizeQuickBooksAccountHierarchy(input).parentAccountId).toBeUndefined();
  });

  it.each([
    {
      expectedReason: "conflicting_parent_ids",
      value: account({ parentRef: { value: "parent_a" }, parentAccountId: "parent_b" })
    },
    {
      expectedReason: "missing_parent_id",
      value: account({ subAccount: true })
    },
    {
      expectedReason: "missing_parent_id",
      value: account({ parentRef: { name: "Display name only" } })
    },
    {
      expectedReason: "conflicting_subaccount_flag",
      value: account({ parentAccountId: "parent_a", subAccount: false })
    },
    {
      expectedReason: "self_parent",
      value: account({ parentAccountId: "child_1" })
    }
  ] as const)("rejects malformed hierarchy with $expectedReason diagnostics", ({ expectedReason, value }) => {
    expect(() => normalizeQuickBooksAccountHierarchy(value)).toThrowError(
      expect.objectContaining<Partial<HandrailQuickBooksAccountHierarchyError>>({
        code: "INVALID_ACCOUNT_HIERARCHY",
        reason: expectedReason
      })
    );
  });

  it("normalizes account resources at both full and incremental sync boundaries", () => {
    const child = account({ parentAccountId: "parent_1" });
    const syncJob = {
      ...contractResponses.fullSyncJob,
      normalizedResources: {
        ...contractResponses.fullSyncJob.normalizedResources,
        accounts: [child]
      }
    } satisfies HandrailQuickBooksSyncJobSummary;

    expect(toNormalizedQuickBooksFullSyncResponseEnvelope(syncJob).normalizedResources?.accounts?.[0])
      .toMatchObject({ parentAccountId: "parent_1", parentRef: { value: "parent_1" } });
    expect(toNormalizedQuickBooksIncrementalSyncResponseEnvelope(syncJob).normalizedResources?.accounts?.[0])
      .toMatchObject({ parentAccountId: "parent_1", parentRef: { value: "parent_1" } });
    expect(normalizeQuickBooksAccountResources({ accounts: [child] })?.accounts?.[0])
      .toMatchObject({ parentAccountId: "parent_1", parentRef: { value: "parent_1" } });
  });
});

function account(overrides: Partial<HandrailQuickBooksAccount> = {}): HandrailQuickBooksAccount {
  return {
    tenantId: "tenant_1",
    realmId: "realm_1",
    companyId: "company_1",
    provider: "intuit",
    providerEnvironment: "sandbox",
    source: "quickbooks_accounting_api",
    sourceObjectId: "child_1",
    importBatchId: "batch_1",
    jobId: "job_1",
    importedAt: "2026-08-20T00:00:00.000Z",
    syncedAt: "2026-08-20T00:00:00.000Z",
    audit: {
      importBatchId: "batch_1",
      jobId: "job_1",
      realmId: "realm_1",
      sourcePayloadRef: "raw://batch_1/accounts/child_1"
    },
    id: "account_child_1",
    sourceObject: "Account",
    name: "EDR",
    ...overrides
  };
}
