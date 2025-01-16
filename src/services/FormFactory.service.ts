import type { BaseFilingService } from "./BaseFilingService";
import { Form13FService } from "./Form13F.service";
import { Form4Service } from "./Form4.service";
import { Form8KService } from "./Form8K.service";

// services/filing-factory.service.ts
export class FilingFactoryService {
  getFilingService(filingType: string): BaseFilingService {
    switch (filingType) {
      case "8-K":
        return new Form8KService();
      case "4":
        return new Form4Service();
      case "13F":
        return new Form13FService();
      // Add other filing types
      default:
        throw new Error(`Unsupported filing type: ${filingType}`);
    }
  }
}
