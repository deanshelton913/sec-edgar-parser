// services/base-filing.service.ts
import type { FilingOutput } from "../types/filing-output";

export abstract class BaseFilingService {
  abstract processDocument(documentText: string): Promise<FilingOutput>;

  protected abstract parseDocument(documentText: string): unknown;
}
