// services/form4.service.ts
import { BaseFilingService } from "./BaseFilingService";
import type { Form4Filing } from "../types/form4.types";
import type { FilingOutput } from "../types/filing-output";

export class Form4Service extends BaseFilingService<Form4Filing> {
  async processJson(filingJson: Form4Filing): Promise<FilingOutput> {
    if (!this.validateJson(filingJson)) {
      throw new Error("Invalid Form 4 filing JSON format");
    }

    const keyPoints = this.extractKeyPoints(filingJson);

    return {
      filingId: filingJson.acceptanceDatetime,
      timestamp: new Date(),
      companyName: filingJson.issuer.companyName,
      companyTicker: filingJson.issuer.tradingSymbol,
      filingType: "4",
      significance: this.determineSignificance(filingJson),
      summary: this.generateSummary(keyPoints),
      keyPoints,
      relatedEntities: [filingJson.reportingOwner.name],
    };
  }

  protected validateJson(filingJson: Form4Filing): boolean {
    return (
      !!filingJson.issuer?.companyName &&
      !!filingJson.reportingOwner?.name &&
      (!!filingJson.nonDerivativeTable || !!filingJson.derivativeTable)
    );
  }

  protected extractKeyPoints(filingJson: Form4Filing): string[] {
    // Extract transaction details, ownership changes
    return [];
  }

  protected determineSignificance(
    filingJson: Form4Filing,
  ): "high" | "medium" | "low" {
    // Based on transaction size, insider role, etc.
    return "medium";
  }
}
