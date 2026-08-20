import { HandrailQuickBooksError } from "./errors.js";
import type {
  HandrailQuickBooksAccount,
  HandrailQuickBooksNormalizedResourceMap
} from "./types.js";

export type HandrailQuickBooksAccountHierarchyErrorReason =
  | "conflicting_parent_ids"
  | "conflicting_subaccount_flag"
  | "missing_parent_id"
  | "self_parent";

export class HandrailQuickBooksAccountHierarchyError extends HandrailQuickBooksError {
  readonly accountSourceId: string;
  readonly reason: HandrailQuickBooksAccountHierarchyErrorReason;

  constructor(
    account: HandrailQuickBooksAccount,
    reason: HandrailQuickBooksAccountHierarchyErrorReason,
    message: string,
    fields: Readonly<Record<string, unknown>> = {}
  ) {
    super(message, {
      code: "INVALID_ACCOUNT_HIERARCHY",
      details: {
        kind: "quickbooks_account_hierarchy",
        reason,
        accountSourceId: account.sourceObjectId,
        ...fields
      },
      retryable: false
    });
    this.name = "HandrailQuickBooksAccountHierarchyError";
    this.accountSourceId = account.sourceObjectId;
    this.reason = reason;
    Object.setPrototypeOf(this, HandrailQuickBooksAccountHierarchyError.prototype);
  }
}

/**
 * Normalizes the two supported provider parent-id fields without deriving
 * hierarchy from display names, FullyQualifiedName, paths, or indentation.
 */
export function normalizeQuickBooksAccountHierarchy(
  account: HandrailQuickBooksAccount
): HandrailQuickBooksAccount {
  const rawParentRefId = account.parentRef?.value;
  const rawParentAccountId = account.parentAccountId;
  const parentRefId = normalizedProviderId(rawParentRefId);
  const parentAccountId = normalizedProviderId(rawParentAccountId);

  if (account.parentRef !== undefined && parentRefId === undefined) {
    throw hierarchyError(account, "missing_parent_id", "contains an empty parentRef.value");
  }
  if (rawParentAccountId !== undefined && parentAccountId === undefined) {
    throw hierarchyError(account, "missing_parent_id", "contains an empty parentAccountId");
  }
  if (parentRefId !== undefined && parentAccountId !== undefined && parentRefId !== parentAccountId) {
    throw hierarchyError(account, "conflicting_parent_ids", "has conflicting parentRef.value and parentAccountId values", {
      parentRefId,
      parentAccountId
    });
  }

  const resolvedParentId = parentRefId ?? parentAccountId;
  if (account.subAccount === true && resolvedParentId === undefined) {
    throw hierarchyError(account, "missing_parent_id", "is marked as a sub-account but has no stable parent account id");
  }
  if (account.subAccount === false && resolvedParentId !== undefined) {
    throw hierarchyError(account, "conflicting_subaccount_flag", "has a parent account id but is marked as a root account", {
      parentAccountId: resolvedParentId
    });
  }
  if (resolvedParentId === account.sourceObjectId.trim()) {
    throw hierarchyError(account, "self_parent", "cannot be its own parent", {
      parentAccountId: resolvedParentId
    });
  }

  if (resolvedParentId === undefined) {
    return account;
  }

  return {
    ...account,
    subAccount: true,
    parentAccountId: resolvedParentId,
    parentRef: {
      ...(account.parentRef ?? {}),
      value: resolvedParentId,
      ...(account.parentRef?.name === undefined && account.parentAccountName !== undefined
        ? { name: account.parentAccountName }
        : {})
    }
  };
}

export function normalizeQuickBooksAccounts(
  accounts: readonly HandrailQuickBooksAccount[]
): readonly HandrailQuickBooksAccount[] {
  return accounts.map(normalizeQuickBooksAccountHierarchy);
}

export function normalizeQuickBooksAccountResources(
  resources: HandrailQuickBooksNormalizedResourceMap | undefined
): HandrailQuickBooksNormalizedResourceMap | undefined {
  if (resources?.accounts === undefined) {
    return resources;
  }
  return { ...resources, accounts: normalizeQuickBooksAccounts(resources.accounts) };
}

function normalizedProviderId(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === "" ? undefined : normalized;
}

function hierarchyError(
  account: HandrailQuickBooksAccount,
  reason: HandrailQuickBooksAccountHierarchyErrorReason,
  description: string,
  fields: Readonly<Record<string, unknown>> = {}
): HandrailQuickBooksAccountHierarchyError {
  return new HandrailQuickBooksAccountHierarchyError(
    account,
    reason,
    `QuickBooks account ${account.sourceObjectId} ${description}.`,
    fields
  );
}
