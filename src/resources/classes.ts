import { HandrailQuickBooksResource } from "./base.js";
import type {
  HandrailQuickBooksClass,
  HandrailQuickBooksListRequest,
  HandrailQuickBooksListResponse
} from "../types.js";

export interface ListClassesRequest extends HandrailQuickBooksListRequest {
  readonly active?: boolean;
  readonly isActive?: boolean;
}

export class ClassesResource extends HandrailQuickBooksResource {
  list(request: ListClassesRequest = {}) {
    return this.http.request<HandrailQuickBooksListResponse<HandrailQuickBooksClass>>(
      this.accountingTenantPath("classes"),
      {
        query: request
      }
    );
  }

  get(classId: string) {
    return this.http.request<HandrailQuickBooksClass>(
      this.accountingTenantPath(`classes/${encodeURIComponent(classId)}`)
    );
  }
}
