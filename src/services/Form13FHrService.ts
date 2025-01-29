/**
 * Service for processing SEC Form 13F filings.
 *
 * Form 13F is used by institutional investment managers to report their holdings
 * of securities. This includes information about the securities they manage,
 * allowing investors to see the investment strategies and positions of these
 * managers. The form provides transparency and helps investors make informed
 * decisions based on the holdings of large institutional investors.
 */

import type { Form13FFiling } from "../types/form13f.types";
import type { ParsedDocument } from "../types/filing-output";
import { XMLParser } from "fast-xml-parser";

import { inject, injectable } from "tsyringe";
import type { GenericSecParsingService } from "./GenericSecParsingService";
import type { ParserService } from "./ParserService";

/**
 * Service for processing SEC Form 13F filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
@injectable()
export class Form13FHrService {
  constructor(
    @inject("GenericSecParsingService")
    private genericSecParsingService: GenericSecParsingService<
      ParsedDocument<Form13FFiling>,
      Form13FFiling
    >,
    @inject("ParserService")
    private parserService: ParserService,
  ) {}
  protected getFilingAgent(
    parsedDoc: Form13FFiling,
    _documentText: string,
  ): string {
    return parsedDoc.edgarSubmission.formData.coverPage.filingManager.name;
  }

  protected extractTradingSymbol(
    _parsedDocument: Form13FFiling,
    _documentText: string,
  ): string | null {
    return null;
  }

  protected extractCusip(
    parsedDocument: Form13FFiling,
    _documentText: string,
  ): string | null {
    return parsedDocument.infoTable.cusip;
  }

  public async parseDocumentAndFormatOutput(
    documentText: string,
    url: string,
  ): Promise<ParsedDocument<Form13FFiling>> {
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
        ) as unknown as Form13FFiling["edgarSubmission"];
    }

    // process the info table from the form 13f-hr filing.
    match = documentText.match(/<infoTable>([\s\S]*?)<\/infoTable>/g);
    if (match) {
      const xmlContent = match[0];
      const parsedXml = xmlParser.parse(xmlContent);
      baseDoc.parsed.infoTable =
        this.parserService.normalizeKnownKeysAsAppropriateDataTypes(
          parsedXml.infoTable,
        ) as unknown as Form13FFiling["infoTable"];
    }
    return baseDoc;
  }

  /**
   * Assess impact of the filing based on holdings and other relevant data
   * @param {string} rawDocumentText - Raw document text
   * @param {ParsedDocument<Form13FFiling>} parsedDoc  - Parsed document data
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
    parsedDoc: Form13FFiling,
  ): ParsedDocument<Form13FFiling>["estimatedImpact"] {
    // Get base sentiment analysis from parent class
    const baseImpact = this.genericSecParsingService.assessImpact(
      rawDocumentText,
      parsedDoc,
    );
    // Analyze the holdings and calculate the total value
    const totalValue = parsedDoc.infoTable.value; // Accessing value directly from infoTable
    const sharesOrPrnAmt = parsedDoc.infoTable.shrsOrPrnAmt.sshPrnamt; // Accessing shares or principal amount
    const votingAuthority = parsedDoc.infoTable.votingAuthority; // Accessing voting authority

    // Determine market impact based on total holdings value, shares, and voting authority
    let marketImpact: "positive" | "negative" | "neutral";

    // Example logic for determining market impact based on holdings
    // 1000000 is the threshold for a large holding
    // 100000 is the threshold for a medium holding
    // 500000 is the threshold for a small holding
    if (
      totalValue > 1000000 &&
      sharesOrPrnAmt > 100000 &&
      votingAuthority.Sole > 0
    ) {
      marketImpact = "positive";
    } else if (totalValue < 500000 && sharesOrPrnAmt < 50000) {
      marketImpact = "negative";
    } else {
      marketImpact = "neutral";
    }

    // Calculate confidence based on shares and voting authority
    const confidence =
      (sharesOrPrnAmt / totalValue) *
      (votingAuthority.Sole /
        (votingAuthority.Sole + votingAuthority.Shared + votingAuthority.None));

    return {
      marketImpact,
      totalScore: Number.parseFloat(totalValue.toFixed(8)), // Normalize total value to be between 0 and 1
      confidence: Number.parseFloat(confidence.toFixed(8)), // Ensure confidence is between 0 and 1
      sentiment: Number.parseFloat(baseImpact.sentiment.toFixed(8)), // Using sentiment from base impact
    };
  }
}
