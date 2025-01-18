import type { BaseFilingService } from "./BaseFilingService";
import { Form13FService } from "./Form13F.service";
import { Form4Service } from "./Form4.service";
import { Form8KService } from "./Form8K.service";
import type { Form8KData } from "../types/form8k.types";
import type { ParsedDocument } from "../types/filing-output";
import type { Form13FFiling } from "src/types/form13f.types";
import type { Form4Data } from "src/types/form4.types";

type ParsedDocumentTypes = Form8KData | Form4Data | Form13FFiling;

// services/filing-factory.service.ts
export class FilingFactoryService {
  getFilingService(
    submissionType: string,
  ): BaseFilingService<
    ParsedDocument<ParsedDocumentTypes>,
    ParsedDocumentTypes
  > {
    switch (submissionType) {
      case "8-K":
        return new Form8KService();
      case "4":
        return new Form4Service();
      case "13F":
        return new Form13FService();
      // Add other filing types
      default:
        throw new Error(`Unsupported filing type: ${submissionType}`);
    }
  }
}
