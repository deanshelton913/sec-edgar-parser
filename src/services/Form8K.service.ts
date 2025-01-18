import { type Form8KData, Form8KItemTextMap } from "../types/form8k.types";
import { BaseFilingService } from "./BaseFilingService";
import { form8kItemSentimentWeights } from "../data/item-weights";
import type { ParsedDocument } from "../types/filing-output";

/**
 * Service for processing SEC Form 8-K filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
export class Form8KService extends BaseFilingService<
  ParsedDocument<Form8KData>,
  Form8KData
> {
  protected getFilingAgent(parsedDoc: Form8KData): string {
    return parsedDoc.filer[0].companyData.companyConformedName;
  }

  /**
   * Assess impact of the filing based on item sentiment and weights
   * @param {string} rawDocumentText - Raw document text
   * @param {ParsedDocument<Form8KData>} parsedDoc  - Parsed document data
   * @returns Impact assessment of 8-K filing with market impact, confidence, total score, and sentiment.
   *
   * The assessment process:
   * 1. Gets base sentiment analysis from parent class
   * 2. Identifies specific 8-K item types (e.g. Item 1.01, 2.01) from the filing
   * 3. Applies pre-defined weights to each item type based on historical market impact
   * 4. Calculates weighted average impact score across all items
   *
   * @returns Impact assessment containing:
   *  - marketImpact: "positive", "negative", or "neutral"
   *  - confidence: Value between 0-1 indicating assessment confidence
   *  - totalScore: Weighted impact score considering item types
   *  - sentiment: Raw sentiment score from text analysis
   */
  protected assessImpact(
    rawDocumentText: string,
    parsedDoc: Form8KData,
  ): ParsedDocument<Form8KData>["estimatedImpact"] {
    // Get base sentiment analysis from parent class
    const baseImpact = super.assessImpact(rawDocumentText, parsedDoc);

    // Store weight multipliers for each item type found
    const itemWeights: Record<string, number> = {};

    // Extract and map item numbers from the filing text to their standardized codes
    // e.g. "Item 1.01" -> "1.01" and look up corresponding weights
    const itemNumbers = parsedDoc.itemInformation
      .map((itemText) => {
        const itemNumber =
          Form8KItemTextMap[itemText as keyof typeof Form8KItemTextMap];
        if (itemNumber) {
          // Use predefined weight for the item type, or default to 0.1
          itemWeights[itemNumber] =
            form8kItemSentimentWeights[itemNumber] ?? 0.1;
        }
        return itemNumber || null;
      })
      .filter(Boolean); // Remove any null values

    // If we found valid item types, calculate weighted impact score
    if (itemNumbers.length > 0) {
      let totalScore = 0;

      // For each item type, multiply its weight by the base sentiment
      for (const itemNumber of itemNumbers) {
        totalScore += (itemWeights[itemNumber] ?? 0.1) * baseImpact.sentiment;
      }

      // Average the score across all items to normalize
      totalScore = totalScore / itemNumbers.length;

      return {
        ...baseImpact,
        totalScore,
        marketImpact:
          totalScore > 0 ? "positive" : totalScore < 0 ? "negative" : "neutral",
      };
    }

    // If no valid items found, return the base sentiment analysis
    return baseImpact;
  }
}
