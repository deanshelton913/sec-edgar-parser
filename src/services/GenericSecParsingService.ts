// services/base-filing.service.ts
import type { ConsistentDocumentFields } from "../types/filing-output";
import type { ParsedDocument } from "../types/filing-output";
import Sentiment from "sentiment";
import { vagueTerms } from "../data/vague-terms";

import type { StorageService } from "./StorageService";

import { injectable, inject } from "tsyringe";
import type { ParserService } from "./ParserService";
import { FailureByDesign } from "../FailureByDesign";
import type { UueCodecService } from "./UueCodecService";
import type { LoggingService } from "./LoggingService";
import type { HttpService } from "./HttpService";

const sentiment = new Sentiment();

@injectable()
export class GenericSecParsingService<
  T extends ParsedDocument<A>,
  A extends ConsistentDocumentFields,
> {
  constructor(
    @inject("ParserService") private parserService: ParserService,
    @inject("UueCodecService") private uueCodecService: UueCodecService,
    @inject("StorageService") private storageService: StorageService,
    @inject("LoggingService") private loggingService: LoggingService,
    @inject("HttpService") private httpService: HttpService,
  ) {}

  public async parseDocumentAndFormatOutput(
    documentText: string,
    url: string,
  ): Promise<T> {
    const parsedDocument = (await this.parserService.parseRawSecFiling(
      documentText,
    )) as A;

    return {
      basic: {
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
        submissionType: this.getSubmissionType(parsedDocument, documentText), // the type of filing, e.g. 8-K, 13F, etc.
        url,
      },
      estimatedImpact: this.assessImpact(documentText, parsedDocument), // the estimated impact of the filing on the market
      parsed: parsedDocument, // This does duplicate data, but it's here to allow for type safety.
      attachments: await this.getAttachments(parsedDocument, documentText, url),
    } as unknown as T;
  }

  protected async getAttachments(
    parsedDocument: A,
    documentText: string,
    url: string,
  ): Promise<string[]> {
    const publicDocumentCount = Number.parseInt(
      parsedDocument.publicDocumentCount,
    );
    if (publicDocumentCount === 0) {
      return [];
    }
    const files = this.uueCodecService.decodeUuEncodedFiles(documentText);
    if (files.length === 0) {
      const requestId = await this.httpService.deriveRequestId(url);
      this.loggingService.warn(
        `[BASE_FILING_SERVICE][${requestId}] NO_ATTACHMENTS_FOUND`,
      );
      return [];
    }
    this.loggingService.debug(
      `[BASE_FILING_SERVICE] DECODING_ATTACHMENTS: ${url}`,
    );
    const promises = [];
    const keys = [];
    for (const file of files) {
      const basePath = this.storageService.getS3KeyFromSecUrl(url);
      const key = `${basePath}/${file.name}`;
      keys.push(key);
      promises.push(this.storageService.writeFile(key, file.data));
    }
    this.loggingService.debug(
      `[BASE_FILING_SERVICE] WRITING_ATTACHMENTS: ${keys.join(",\n")}`,
    );
    await Promise.all(promises);

    return keys;
  }

  /**
   * Extracts company trading symbol from document text using regex patterns
   */
  protected extractTradingSymbol(
    _parsedDocument: A,
    _documentText: string,
  ): string | null {
    throw new FailureByDesign(
      "extractTradingSymbol must be implemented by the subclass",
    );
  }

  protected getAccessionNumber(parsedDoc: A, _documentText: string): string {
    return parsedDoc.accessionNumber;
  }

  protected getAcceptanceDatetime(parsedDoc: A, _documentText: string): number {
    return this.parseDatetime(parsedDoc.acceptanceDatetime);
  }

  protected getPublicDocumentCount(
    parsedDoc: A,
    _documentText: string,
  ): string {
    return parsedDoc.publicDocumentCount;
  }

  protected parseDatetime(input: number | string): number {
    // Convert the input to a string for consistent processing
    const datetimeStr = input.toString();

    let formattedDate: string;

    // Determine the format based on the input length
    if (datetimeStr.length === 14) {
      // Format for full datetime (YYYYMMDDHHMMSS)
      formattedDate = `${datetimeStr.slice(0, 4)}-${datetimeStr.slice(
        4,
        6,
      )}-${datetimeStr.slice(6, 8)}T${datetimeStr.slice(
        8,
        10,
      )}:${datetimeStr.slice(10, 12)}:${datetimeStr.slice(12, 14)}-04:00`;
    } else if (datetimeStr.length === 8) {
      // Format for date only (YYYYMMDD)
      formattedDate = `${datetimeStr.slice(0, 4)}-${datetimeStr.slice(
        4,
        6,
      )}-${datetimeStr.slice(6, 8)}T00:00:00-04:00`;
    } else {
      throw new Error(`Unexpected datetime format: ${datetimeStr}`);
    }

    // Convert to Unix timestamp and return (in seconds)
    return Math.floor(new Date(formattedDate).getTime() / 1000);
  }

  protected getFiledAsOfDate(parsedDoc: A, _documentText: string): number {
    return this.parseDatetime(parsedDoc.filedAsOfDate);
  }

  protected getSubmissionType(parsedDoc: A, _documentText: string): string {
    return parsedDoc.conformedSubmissionType;
  }

  /**
   * Base implementation of impact assessment
   */
  public assessImpact(
    rawDocumentText: string,
    _parsedDoc: A,
  ): ParsedDocument<A>["estimatedImpact"] {
    let totalScore = 0;
    let confidence = 0.5;

    const { sentiment, clarity } = this.assessBaseImpact(rawDocumentText);
    const weight = 0.1;
    totalScore += Number.parseFloat((weight * sentiment).toFixed(8));
    confidence = Number.parseFloat((confidence + clarity * 0.1).toFixed(8));

    return {
      marketImpact:
        sentiment > 0.1
          ? "positive"
          : sentiment < -0.1
            ? "negative"
            : "neutral",
      confidence: Number.parseFloat(
        Math.min(Math.max(confidence, 0), 1).toFixed(8),
      ),
      totalScore: Number.parseFloat(
        Math.min(Math.max(totalScore, 0), 1).toFixed(8),
      ),
      sentiment: Number.parseFloat(
        Math.min(Math.max(sentiment, 0), 1).toFixed(8),
      ),
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
