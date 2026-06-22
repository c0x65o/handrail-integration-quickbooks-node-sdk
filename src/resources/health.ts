import { HandrailQuickBooksResource } from "./base.js";
import type { HandrailQuickBooksHealthResponse } from "../types.js";

export class HealthResource extends HandrailQuickBooksResource {
  get() {
    return this.http.request<HandrailQuickBooksHealthResponse>("/.well-known/healthz");
  }
}
