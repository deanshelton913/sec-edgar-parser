import { FailureByDesign } from "../FailureByDesign";
import type { Form13FHrService } from "./Form13FHrService";
import type { Form4Service } from "./Form4Service";
import type { Form8KService } from "./Form8KService";
import { inject, injectable } from "tsyringe";

type ParsedDocumentService = Form8KService | Form4Service | Form13FHrService;
@injectable()
export class FormFactoryService {
  constructor(
    @inject("Form8KService") private form8KService: Form8KService,
    @inject("Form4Service") private form4Service: Form4Service,
    @inject("Form13FHrService") private form13FHrService: Form13FHrService,
  ) {}

  public getFilingService(submissionType: string): ParsedDocumentService {
    let filingService: ParsedDocumentService;
    switch (submissionType) {
      case "8-K": {
        filingService = this.form8KService;
        break;
      }
      case "4":
      case "4/A": {
        filingService = this.form4Service;
        break;
      }
      case "13F-HR": {
        filingService = this.form13FHrService;
        break;
      }
      default: {
        throw new FailureByDesign(
          `[FORM_FACTORY] UNSUPPORTED_FILING_TYPE: ${submissionType}`,
          422,
        );
      }
    }
    return filingService;
  }
}
