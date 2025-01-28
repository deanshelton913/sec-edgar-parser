import type { Form13FHrService } from "./Form13FHrService";
import type { Form4Service } from "./Form4Service";
import type { Form8KService } from "./Form8KService";
import { inject, injectable } from "tsyringe";
import type { EdgarFilingRssFeedItem } from "./RssService";
import type { GenericSecParsingService } from "./GenericSecParsingService";
import type { LoggingService } from "./LoggingService";
import type {
  ConsistentDocumentFields,
  ParsedDocument,
} from "src/types/filing-output";

type ParsedDocumentService =
  | Form8KService
  | Form4Service
  | Form13FHrService
  | GenericSecParsingService<
      ParsedDocument<ConsistentDocumentFields>,
      ConsistentDocumentFields
    >;
@injectable()
export class FormFactoryService {
  constructor(
    @inject("Form8KService") private form8KService: Form8KService,
    @inject("Form4Service") private form4Service: Form4Service,
    @inject("Form13FHrService") private form13FHrService: Form13FHrService,
    @inject("LoggingService") private loggingService: LoggingService,
    @inject("GenericSecParsingService")
    private genericSecParsingService: GenericSecParsingService<
      ParsedDocument<ConsistentDocumentFields>,
      ConsistentDocumentFields
    >,
  ) {}

  public getFilingService(
    filing: EdgarFilingRssFeedItem,
  ): ParsedDocumentService {
    let filingService: ParsedDocumentService;
    switch (filing.category.$.term) {
      case "8-K": {
        filingService = this.form8KService;
        break;
      }
      case "4": {
        filingService = this.form4Service;
        break;
      }
      case "4/A": {
        filingService = this.form4Service;
        break;
      }
      case "13F-HR": {
        filingService = this.form13FHrService;
        break;
      }
      default: {
        filingService = this.genericSecParsingService;
        this.loggingService.debug(
          `[FORM_FACTORY] USING_GENERIC_PARSING_SERVICE: ${filing.category.$.term}: ${filing.link} `,
        );
      }
    }
    return filingService;
  }
}
