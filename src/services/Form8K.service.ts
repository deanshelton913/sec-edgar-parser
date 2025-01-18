/**
 * Service for processing SEC Form 8-K filings.
 *
 * Form 8-K is used to report major events that shareholders should know about.
 * This includes significant corporate events such as mergers, acquisitions,
 * changes in control, bankruptcy, and other important events that may affect
 * the company's financial condition or operations. The form provides timely
 * disclosure to ensure that investors have access to important information
 * that could impact their investment decisions.
 */

import { type Form8KData, Form8KItemTextMap } from "../types/form8k.types";
import { BaseFilingService } from "./BaseFilingService";
import { form8KItemSentimentWeights } from "../data/item-weights";
import type { ParsedDocument } from "../types/filing-output";

/**
 * Service for processing SEC Form 8-K filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
export class Form8KService extends BaseFilingService<
  ParsedDocument<Form8KData>,
  Form8KData
> {
  /**
   * Extracts company trading symbol from document text using regex patterns
   */
  protected extractTradingSymbol(
    _parsedDocument: Form8KData,
    documentText: string,
  ): string | null {
    const patterns = [/\(OTC:\s*([A-Z]+)\)/i];

    for (const pattern of patterns) {
      const match = documentText.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  protected getFilingAgent(
    parsedDoc: Form8KData,
    _documentText: string,
  ): string {
    return parsedDoc.filer[0].companyData.companyConformedName;
  }

  protected extractCusip(
    _parsedDocument: Form8KData,
    _documentText: string,
  ): string | null {
    return null;
  }

  /**
   * Assess impact of the filing based on item sentiment and weights
   * @param {string} rawDocumentText - Raw document text
   * @param {ParsedDocument<Form8KData>} parsedDoc  - Parsed document data
   * @returns Impact assessment of 8-K filing with market impact, confidence, total score, and sentiment.
   *
   * The assessment process:
   * 1. Gets base sentiment analysis from parent class
   * 2. Identifies specific 8-K item types (e.g. Item 1, 2) from the filing
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
    const itemNumbers = parsedDoc.itemInformation
      .map((itemText) => {
        const itemNumber =
          Form8KItemTextMap[itemText as keyof typeof Form8KItemTextMap];

        if (itemNumber) {
          // Use predefined weight for the item type, or default to 0.1
          itemWeights[itemNumber] =
            form8KItemSentimentWeights[itemNumber] ?? 0.1;
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
        totalScore: Number.parseFloat(totalScore.toFixed(8)),
        marketImpact:
          totalScore > 0.1
            ? "positive"
            : totalScore < -0.1
              ? "negative"
              : "neutral",
      };
    }

    // If no valid items found, return the base sentiment analysis
    return baseImpact;
  }
}
