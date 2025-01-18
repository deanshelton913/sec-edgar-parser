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
import { BaseFilingService } from "./BaseFilingService";
import type { ParsedDocument } from "../types/filing-output";
import { XMLParser } from "fast-xml-parser";
import { normalizeKnownKeysAsAppropriateDataTypes } from "../parser";

/**
 * Service for processing SEC Form 13F filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
export class Form13FHrService extends BaseFilingService<
  ParsedDocument<Form13FFiling>,
  Form13FFiling
> {
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

  /**
   * Adds some unique form4 fields to the parsed document.
   * @param documentText - The text of the document to parse.
   * @returns The parsed document with the ownership document.
   */
  protected async parseDocument(documentText: string): Promise<Form13FFiling> {
    const parsed = await super.parseDocument(documentText);
    const xmlParser = new XMLParser();

    // process the edgarSubmission from the form 13f-hr filing.
    let match = documentText.match(
      /<edgarSubmission.*?>([\s\S]*?)<\/edgarSubmission>/g,
    );
    if (match) {
      const xmlContent = match[0];
      const parsedXml = xmlParser.parse(xmlContent);
      parsed.edgarSubmission = normalizeKnownKeysAsAppropriateDataTypes(
        parsedXml.edgarSubmission,
      ) as unknown as Form13FFiling["edgarSubmission"];
    }

    // process the info table from the form 13f-hr filing.
    match = documentText.match(/<infoTable>([\s\S]*?)<\/infoTable>/g);
    if (match) {
      const xmlContent = match[0];
      const parsedXml = xmlParser.parse(xmlContent);
      parsed.infoTable = normalizeKnownKeysAsAppropriateDataTypes(
        parsedXml.infoTable,
      ) as unknown as Form13FFiling["infoTable"];
    }

    return parsed;
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
    const baseImpact = super.assessImpact(rawDocumentText, parsedDoc);

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
      totalScore: totalValue, // Using total value as a score
      confidence: Math.min(Math.max(confidence, 0), 1), // Ensure confidence is between 0 and 1
      sentiment: baseImpact.sentiment, // Using sentiment from base impact
    };
  }
}
