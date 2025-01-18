/**
 * Service for processing SEC Form 8-K filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
import { type Form8KData, Form8KItemTextMap } from "../types/form8k.types";
import { BaseFilingService } from "./BaseFilingService";
import { form8kItemSentimentWeights } from "../data/item-weights";
import type { ParsedDocument } from "../types/filing-output";

export class Form8KService extends BaseFilingService<
  ParsedDocument<Form8KData>,
  Form8KData
> {
  protected getFilingAgent(parsedDoc: Form8KData): string {
    return parsedDoc.filer[0].companyData.companyConformedName;
  }

  protected assessImpact(
    rawDocumentText: string,
    parsedDoc: Form8KData,
  ): ParsedDocument<Form8KData>["estimatedImpact"] {
    const baseImpact = super.assessImpact(rawDocumentText, parsedDoc);
    const itemWeights: Record<string, number> = {};

    // Get item numbers from the filing
    const itemNumbers = parsedDoc.itemInformation
      .map((itemText) => {
        const itemNumber =
          Form8KItemTextMap[itemText as keyof typeof Form8KItemTextMap];
        if (itemNumber) {
          itemWeights[itemNumber] =
            form8kItemSentimentWeights[itemNumber] ?? 0.1;
        }
        return itemNumber || null;
      })
      .filter(Boolean);

    // Calculate weighted impact if we have items
    if (itemNumbers.length > 0) {
      let totalScore = 0;
      for (const itemNumber of itemNumbers) {
        totalScore += (itemWeights[itemNumber] ?? 0.1) * baseImpact.sentiment;
      }
      totalScore = totalScore / itemNumbers.length;

      return {
        ...baseImpact,
        totalScore,
        marketImpact:
          totalScore > 0 ? "positive" : totalScore < 0 ? "negative" : "neutral",
      };
    }

    return baseImpact;
  }
}
