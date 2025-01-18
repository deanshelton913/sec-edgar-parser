// services/base-filing.service.ts
import type { ConsistentDocumentFields } from "../types/filing-output";
import type { ParsedDocument } from "../types/filing-output";
import Sentiment from "sentiment";
import { vagueTerms } from "../data/vague-terms";
import * as parser from "../parser";

const sentiment = new Sentiment();

export abstract class BaseFilingService<
  T extends ParsedDocument<A>,
  A extends ConsistentDocumentFields,
> {
  /**
   * IMPORTANT: This must be implemented by the subclass.
   * Returns the person, company, or entity filing the document.
   */
  protected abstract getFilingAgent(parsedDoc: A, documentText: string): string;

  /**
   * Processes a document and extracts key information
   */
  async processDocument(documentText: string): Promise<T> {
    const parsedDocument = await this.parseDocument(documentText);

    return {
      derived: {
        accessionNumber: this.getAccessionNumber(parsedDocument, documentText),
        acceptanceDatetime: this.getAcceptanceDatetime(
          parsedDocument,
          documentText,
        ),
        publicDocumentCount: this.getPublicDocumentCount(
          parsedDocument,
          documentText,
        ),
        filedAsOfDate: this.getFiledAsOfDate(parsedDocument, documentText),
        dateAsOfChange: this.getDateAsOfChange(parsedDocument, documentText),
        filingAgent: this.getFilingAgent(parsedDocument, documentText), // the person, company, or entity filing the document
        tradingSymbol: this.extractTradingSymbol(parsedDocument, documentText), // the trading symbol of the company filing the document
        submissionType: this.getSubmissionType(parsedDocument, documentText), // the type of filing, e.g. 8-K, 13F, etc.
      },
      estimatedImpact: this.assessImpact(documentText, parsedDocument), // the estimated impact of the filing on the market
      parsed: parsedDocument, // This does duplicate data, but it's here to allow for type safety.
    } as unknown as T;
  }

  /**
   * Parses raw document text into structured data
   */
  protected async parseDocument(documentText: string): Promise<A> {
    return parser.getObjectFromString(documentText);
  }

  /**
   * Extracts company trading symbol from document text using regex patterns
   */
  protected extractTradingSymbol(
    _parsedDocument: A,
    documentText: string,
  ): string | null {
    const patterns = [
      /\(OTC:\s*([A-Z]+)\)/i,
      /Trading Symbol:\s*([A-Z]+)/i,
      /\(Trading Symbol:\s*([A-Z]+)\)/i,
      /\(Symbol:\s*([A-Z]+)\)/i,
      /<TR><TD[^>]*>([A-Z]{1,5})<\/TD>/i,
    ];

    for (const pattern of patterns) {
      const match = documentText.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  protected getAccessionNumber(parsedDoc: A, _documentText: string): string {
    return parsedDoc.accessionNumber;
  }

  protected getAcceptanceDatetime(parsedDoc: A, _documentText: string): number {
    return Math.floor(
      new Date(
        `${parsedDoc.acceptanceDatetime.slice(
          0,
          4,
        )}-${parsedDoc.acceptanceDatetime.slice(
          4,
          6,
        )}-${parsedDoc.acceptanceDatetime.slice(
          6,
          8,
        )} ${parsedDoc.acceptanceDatetime.slice(
          8,
          10,
        )}:${parsedDoc.acceptanceDatetime.slice(
          10,
          12,
        )}:${parsedDoc.acceptanceDatetime.slice(12, 14)}`,
      ).getTime() / 1000,
    );
  }

  protected getPublicDocumentCount(
    parsedDoc: A,
    _documentText: string,
  ): string {
    return parsedDoc.publicDocumentCount;
  }

  protected getFiledAsOfDate(parsedDoc: A, _documentText: string): number {
    return Math.floor(
      new Date(
        `${parsedDoc.filedAsOfDate.slice(0, 4)}-${parsedDoc.filedAsOfDate.slice(
          4,
          6,
        )}-${parsedDoc.filedAsOfDate.slice(6, 8)}`,
      ).getTime() / 1000,
    );
  }

  protected getDateAsOfChange(parsedDoc: A, _documentText: string): number {
    return Math.floor(
      new Date(
        `${parsedDoc.dateAsOfChange.slice(
          0,
          4,
        )}-${parsedDoc.dateAsOfChange.slice(
          4,
          6,
        )}-${parsedDoc.dateAsOfChange.slice(6, 8)}`,
      ).getTime() / 1000,
    );
  }

  protected getSubmissionType(parsedDoc: A, _documentText: string): string {
    return parsedDoc.conformedSubmissionType;
  }

  /**
   * Base implementation of impact assessment
   */
  protected assessImpact(
    rawDocumentText: string,
    _parsedDoc: A,
  ): ParsedDocument<A>["estimatedImpact"] {
    let totalScore = 0;
    let confidence = 0.5;

    const { sentiment, clarity } = this.assessBaseImpact(rawDocumentText);

    const weight = 0.1;
    totalScore += weight * sentiment;
    confidence += clarity * 0.1;

    return {
      marketImpact:
        totalScore > 0 ? "positive" : totalScore < 0 ? "negative" : "neutral",
      confidence: Math.min(confidence, 1.0),
      totalScore,
      sentiment,
    };
  }

  /**
   * Analyzes sentiment of document text using sentiment analysis library
   * @param content - Text content to analyze
   * @returns Normalized sentiment score
   */
  protected analyzeSentiment(content: string): number {
    const analysisResult = sentiment.analyze(content);
    return analysisResult.comparative;
  }

  /**
   * Assesses clarity of language by checking for vague/uncertain terms
   * Higher score = clearer language with fewer vague terms
   * @param content - Text content to analyze
   * @returns Clarity score between 0-1
   */
  protected assessClarity(content: string): number {
    const wordCount = content.split(/\s+/).length;
    const vagueCount = vagueTerms.filter((term) =>
      content.toLowerCase().includes(term),
    ).length;

    return 1 - vagueCount / wordCount;
  }

  /**
   * Base method for impact assessment that can be extended by specific filing types
   * @param documentText - Raw document text
   * @returns Basic impact assessment
   */
  protected assessBaseImpact(documentText: string): {
    sentiment: number;
    clarity: number;
  } {
    return {
      sentiment: this.analyzeSentiment(documentText),
      clarity: this.assessClarity(documentText),
    };
  }
}
