import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse,
  HandrailQuickBooksStartSyncRequest,
  HandrailQuickBooksSyncJobSummary,
  NormalizedQuickBooksFullSyncRequest,
  NormalizedQuickBooksFullSyncResponseEnvelope,
  NormalizedQuickBooksIncrementalSyncRequest,
  NormalizedQuickBooksIncrementalSyncResponseEnvelope
} from "../types.js";

export interface HandrailQuickBooksSyncOptions {
  readonly idempotencyKey?: string;
}

export class SyncJobsResource extends HandrailQuickBooksResource {
  start(request: HandrailQuickBooksStartSyncRequest = {}, options: HandrailQuickBooksSyncOptions = {}) {
    return this.http.request<HandrailQuickBooksSyncJobSummary>(this.tenantPath("sync-jobs"), {
      body: request,
      idempotencyKey: options.idempotencyKey,
      method: "POST"
    });
  }

  async fullSync(
    request: NormalizedQuickBooksFullSyncRequest = {},
    options: HandrailQuickBooksSyncOptions = {}
  ) {
    const syncJob = await this.start({ ...request, mode: "full" }, options);
    return toNormalizedQuickBooksFullSyncResponseEnvelope(syncJob);
  }

  async incrementalSync(
    request: NormalizedQuickBooksIncrementalSyncRequest = {},
    options: HandrailQuickBooksSyncOptions = {}
  ) {
    const syncJob = await this.start({ ...request, mode: "incremental" }, options);
    return toNormalizedQuickBooksIncrementalSyncResponseEnvelope(syncJob);
  }

  get(jobId: string) {
    return this.http.request<HandrailQuickBooksSyncJobSummary>(
      this.tenantPath(`sync-jobs/${encodeURIComponent(jobId)}`)
    );
  }

  list(request: HandrailQuickBooksListRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksSyncJobSummary>>(
      this.tenantPath("sync-jobs"),
      {
        query: request
      }
    );
  }
}

export function toNormalizedQuickBooksFullSyncResponseEnvelope(
  syncJob: HandrailQuickBooksSyncJobSummary
): NormalizedQuickBooksFullSyncResponseEnvelope {
  return {
    ...toNormalizedQuickBooksSyncResponseEnvelopeBase(syncJob),
    syncMode: "full",
    syncPhase: "initial_load"
  };
}

export function toNormalizedQuickBooksIncrementalSyncResponseEnvelope(
  syncJob: HandrailQuickBooksSyncJobSummary
): NormalizedQuickBooksIncrementalSyncResponseEnvelope {
  return {
    ...toNormalizedQuickBooksSyncResponseEnvelopeBase(syncJob),
    syncMode: "incremental",
    syncPhase: "delta_sync"
  };
}

function toNormalizedQuickBooksSyncResponseEnvelopeBase(syncJob: HandrailQuickBooksSyncJobSummary) {
  return {
    audit: syncJob.audit,
    checkpoint: syncJob.checkpoint,
    companyId: syncJob.companyId,
    contractId: "handrail.quickbooks.normalized-sync-envelope.v1" as const,
    deltaCounts: syncJob.deltaCounts,
    importBatch: syncJob.batch,
    importBatchId: syncJob.importBatchId,
    importVolume: syncJob.importVolume,
    jobId: syncJob.jobId,
    normalizedResourceCounts: syncJob.batch?.entityCounts ?? syncJob.importVolume.entityCounts,
    normalizedResources: syncJob.normalizedResources,
    status: syncJob.status,
    syncJob,
    tenantId: syncJob.tenantId
  };
}
