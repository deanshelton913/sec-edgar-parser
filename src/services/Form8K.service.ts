/**
 * Service for processing SEC Form 8-K filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
import type { FilingOutput } from "../types/filing-output";
import { Form8KItemTextMap, type Form8KFiling } from "../types/form8k.types";
import { BaseFilingService } from "./BaseFilingService";
import * as parser from "../parser";
import Sentiment from "sentiment";
import { vagueTerms } from "../data/vague-terms";
import { form8kItemSentimentWeights } from "../data/item-weights";

const sentiment = new Sentiment();

export class Form8KService extends BaseFilingService {
  /**
   * Processes a Form 8-K document and extracts key information
   * @param documentText - Raw text content of the Form 8-K filing
   * @returns Structured filing data including company info and impact assessment
   */
  async processDocument(documentText: string): Promise<FilingOutput> {
    const parsedDoc = await this.parseDocument(documentText);
    return {
      filingId: parsedDoc.accessionNumber,
      timestamp: Math.floor(
        new Date(
          `${parsedDoc.filedAsOfDate.slice(0, 4)}-${parsedDoc.filedAsOfDate.slice(4, 6)}-${parsedDoc.filedAsOfDate.slice(6, 8)}`,
        ).getTime() / 1000,
      ),
      companyName: parsedDoc.filer[0].companyData.companyConformedName,
      companyTicker: this.extractTradingSymbol(documentText),
      filingType: "8-K",
      estimatedImpact: this.assessImpact(parsedDoc, documentText),
    };
  }

  /**
   * Parses raw document text into structured Form 8-K data
   * @param documentText - Raw filing text
   */
  protected async parseDocument(documentText: string): Promise<Form8KFiling> {
    const object = await parser.getObjectFromString(documentText);
    return object as Form8KFiling;
  }

  /**
   * Extracts company trading symbol from document text using regex patterns
   * Searches for common formats like (OTC: XXX), Trading Symbol: XXX, etc.
   * @param documentText - Raw document text to search
   * @returns Found trading symbol or "NOT FOUND"
   */
  private extractTradingSymbol(documentText: string): string {
    // Common patterns for finding trading symbols in 8-K documents
    const patterns = [
      /\(OTC:\s*([A-Z]+)\)/i, // OTC markets format
      /Trading Symbol:\s*([A-Z]+)/i, // Standard format
      /\(Trading Symbol:\s*([A-Z]+)\)/i, // Parenthetical format
      /\(Symbol:\s*([A-Z]+)\)/i, // Short format
      /<TR><TD[^>]*>([A-Z]{1,5})<\/TD>/i, // HTML table format
    ];

    for (const pattern of patterns) {
      const match = documentText.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return "NOT FOUND";
  }

  /**
   * Assesses the market impact of a Form 8-K filing
   * Combines sentiment analysis with pre-defined item weights
   * @param parsedDoc - Parsed Form 8-K document
   * @param rawDocumentText - Raw document text for sentiment analysis
   * @returns Impact assessment including market direction, confidence, and scores
   */
  private assessImpact(
    parsedDoc: Form8KFiling,
    rawDocumentText: string,
  ): {
    marketImpact: "positive" | "negative" | "neutral";
    confidence: number; // 0.0 to 1.0
    totalScore: number;
    itemWeights: Record<string, number>;
    sentiment: number;
  } {
    let totalScore = 0;
    let confidence = 0.5; // Start with moderate confidence

    // Map reported items to their standardized item numbers
    const itemNumbers = parsedDoc.itemInformation.map((itemText) => {
      const itemNumber =
        Form8KItemTextMap[itemText as keyof typeof Form8KItemTextMap];
      return itemNumber || null;
    });

    // Get overall document sentiment
    const sentiment = this.analyzeSentiment(rawDocumentText);

    // Calculate weighted impact score using pre-defined item weights
    const itemWeightsUsed: Record<string, number> = {};
    let itemCount = 0;
    for (const itemNumber of itemNumbers) {
      // Get pre-defined weight for this item type, default to 0.1 if not found
      const weight =
        form8kItemSentimentWeights[
          itemNumber as keyof typeof form8kItemSentimentWeights
        ] ?? 0.1;
      itemWeightsUsed[itemNumber || "unknown"] = weight;
      totalScore += weight * sentiment;

      // Increase confidence if language is clear/specific
      confidence += this.assessClarity(rawDocumentText) * 0.1;
      itemCount++;
    }

    // Average the score across all items
    if (itemCount > 0) {
      totalScore = totalScore / itemCount;
    }

    return {
      marketImpact:
        totalScore > 0 ? "positive" : totalScore < 0 ? "negative" : "neutral",
      confidence: Math.min(confidence, 1.0),
      totalScore,
      sentiment,
      itemWeights: itemWeightsUsed,
    };
  }

  /**
   * Analyzes sentiment of document text using sentiment analysis library
   * @param content - Text content to analyze
   * @returns Normalized sentiment score
   */
  private analyzeSentiment(content: string): number {
    const analysisResult = sentiment.analyze(content);
    return analysisResult.comparative; // Use comparative score for length-normalized results
  }

  /**
   * Assesses clarity of language by checking for vague/uncertain terms
   * Higher score = clearer language with fewer vague terms
   * @param content - Text content to analyze
   * @returns Clarity score between 0-1
   */
  private assessClarity(content: string): number {
    const wordCount = content.split(/\s+/).length;
    const vagueCount = vagueTerms.filter((term) =>
      content.toLowerCase().includes(term),
    ).length;

    return 1 - vagueCount / wordCount;
  }
}
