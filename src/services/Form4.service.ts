/**
 * Service for processing SEC Form 4 filings.
 *
 * Form 4 is used to report changes in ownership of securities by insiders,
 * such as officers, directors, and beneficial owners. It provides details
 * about the transactions involving the reporting person's ownership of
 * the issuer's securities, including the date of the transaction,
 * the amount of securities involved, and the nature of the ownership.
 */

import type { Form4Data } from "../types/form4.types";
import { BaseFilingService } from "./BaseFilingService";
import type { ParsedDocument } from "../types/filing-output";
import { XMLParser } from "fast-xml-parser";
import { normalizeKnownKeysAsAppropriateDataTypes } from "../parser";

/**
 * Service for processing SEC Form 4 filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
export class Form4Service extends BaseFilingService<
  ParsedDocument<Form4Data>,
  Form4Data
> {
  protected getFilingAgent(
    _parsedDoc: Form4Data,
    documentText: string,
  ): string {
    const issuerNameMatch = documentText.match(
      /<issuerName>(.*?)<\/issuerName>/,
    );
    return issuerNameMatch ? issuerNameMatch[1] : "";
  }

  /**
   * Adds some unique form4 fields to the parsed document.
   * @param documentText - The text of the document to parse.
   * @returns The parsed document with the ownership document.
   */
  protected async parseDocument(documentText: string): Promise<Form4Data> {
    const parsed = await super.parseDocument(documentText);
    const xmlParser = new XMLParser();
    const ownershipDocumentMatch = documentText.match(
      /<ownershipDocument>([\s\S]*?)<\/ownershipDocument>/g,
    );
    if (ownershipDocumentMatch) {
      const xmlContent = ownershipDocumentMatch[0];
      const parsedXml = xmlParser.parse(xmlContent);
      parsed.ownershipDocument = normalizeKnownKeysAsAppropriateDataTypes(
        parsedXml.ownershipDocument,
      ) as unknown as Form4Data["ownershipDocument"];
    }
    return parsed;
  }

  protected extractTradingSymbol(
    parsedDocument: Form4Data,
    _documentText: string,
  ): string {
    return parsedDocument.ownershipDocument.issuer[0].issuerTradingSymbol;
  }

  protected assessImpact(
    rawDocumentText: string,
    parsedDoc: Form4Data,
  ): ParsedDocument<Form4Data>["estimatedImpact"] {
    // Get base sentiment analysis from parent class
    const baseImpact = super.assessImpact(rawDocumentText, parsedDoc);
    return baseImpact;
  }
}
