/**
 * Service for processing SEC Form 13F filings.
 *
 * Form 13F is used by institutional investment managers to report their holdings
 * of securities. This includes information about the securities they manage,
 * allowing investors to see the investment strategies and positions of these
 * managers. The form provides transparency and helps investors make informed
 * decisions based on the holdings of large institutional investors.
 */

import type { Schedule13GFiling } from "../types/schedule13g.types";
import type { ParsedDocument } from "../types/filing-output";
import type { GenericSecParsingService } from "./GenericSecParsingService";
import type { ParserService } from "./ParserService";

import { XMLParser } from "fast-xml-parser";
import { inject, injectable } from "tsyringe";

/**
 * Service for processing SEC Form 13F filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
@injectable()
export class Schedule13GService {
  constructor(
    @inject("ParserService")
    private parserService: ParserService,
    @inject("GenericSecParsingService")
    private genericSecParsingService: GenericSecParsingService<
      ParsedDocument<Schedule13GFiling>,
      Schedule13GFiling
    >,
  ) {}
  protected getFilingAgent(
    _parsedDoc: Schedule13GFiling,
    _documentText: string,
  ): string {
    return "";
  }

  protected extractTradingSymbol(
    _parsedDocument: Schedule13GFiling,
    _documentText: string,
  ): string | null {
    return null;
  }

  protected extractCusip(
    _parsedDocument: Schedule13GFiling,
    _documentText: string,
  ): string | null {
    return null;
  }

  public async parseDocumentAndFormatOutput(
    documentText: string,
    url: string,
  ): Promise<ParsedDocument<Schedule13GFiling>> {
    const baseDoc =
      await this.genericSecParsingService.parseDocumentAndFormatOutput(
        documentText,
        url,
      );

    const xmlParser = new XMLParser({
      numberParseOptions: { leadingZeros: false, hex: false, eNotation: false },
    });

    // process the edgarSubmission from the form 13f-hr filing.
    let match = documentText.match(
      /<edgarSubmission.*?>([\s\S]*?)<\/edgarSubmission>/g,
    );
    if (match) {
      const xmlContent = match[0];
      const parsedXml = xmlParser.parse(xmlContent);
      baseDoc.parsed.edgarSubmission =
        this.parserService.normalizeKnownKeysAsAppropriateDataTypes(
          parsedXml.edgarSubmission,
        ) as unknown as Schedule13GFiling["edgarSubmission"];
    }

    // process the info table from the form 13f-hr filing.
    match = documentText.match(/<infoTable>([\s\S]*?)<\/infoTable>/g);
    if (match) {
      const xmlContent = match[0];
      const parsedXml = xmlParser.parse(xmlContent);
      baseDoc.parsed.infoTable =
        this.parserService.normalizeKnownKeysAsAppropriateDataTypes(
          parsedXml.infoTable,
        ) as unknown as Schedule13GFiling["infoTable"];
    }

    return baseDoc;
  }

  /**
   * Assess impact of the filing based on holdings and other relevant data
   * @param {string} rawDocumentText - Raw document text
   * @param {ParsedDocument<Schedule13GFiling>} parsedDoc  - Parsed document data
   * @returns Impact assessment of 13F filing with market impact, confidence, total score, and sentiment.
   *
   * The assessment process:
   * 1. Analyzes the holdings reported in the filing
   * 2. Evaluates the total holdings value, shares or principal amount, and voting authority
   * 3. Determines the market impact based on the size and nature of the holdings
   *
   * @returns Impact assessment containing:
   *  - marketImpact: "positive", "negative", or "neutral"
   *  - confidence: Value between 0-1 indicating assessment confidence
   *  - totalScore: Score based on the analysis of holdings
   */
  protected assessImpact(
    rawDocumentText: string,
    parsedDoc: Schedule13GFiling,
  ): ParsedDocument<Schedule13GFiling>["estimatedImpact"] {
    // Get base sentiment analysis from parent class
    const baseImpact = this.genericSecParsingService.assessImpact(
      rawDocumentText,
      parsedDoc,
    );
    return baseImpact;
  }
}
