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
import type { BaseFilingService } from "./BaseFilingService";
import type { ParsedDocument } from "../types/filing-output";
import { XMLParser } from "fast-xml-parser";
import { inject, injectable } from "tsyringe";
import type { ParserService } from "./ParserService";

/**
 * Service for processing SEC Form 4 filings.
 * Analyzes filing content to determine market impact and sentiment.
 */
@injectable()
export class Form4Service {
  constructor(
    @inject("ParserService") private parserService: ParserService,
    @inject("BaseFilingService")
    private baseFilingService: BaseFilingService<
      ParsedDocument<Form4Data>,
      Form4Data
    >,
  ) {}

  protected getFilingAgent(
    _parsedDoc: Form4Data,
    documentText: string,
  ): string {
    const issuerNameMatch = documentText.match(
      /<issuerName>(.*?)<\/issuerName>/,
    );
    return issuerNameMatch ? issuerNameMatch[1] : "";
  }

  protected extractCusip(
    _parsedDocument: Form4Data,
    _documentText: string,
  ): string | null {
    return null;
  }

  /**
   * Adds some unique form4 fields to the parsed document.
   * @param documentText - The text of the document to parse.
   * @returns The parsed document with the ownership document.
   */
  public async parseDocument(documentText: string): Promise<Form4Data> {
    const parsed = await this.baseFilingService.parseDocument(documentText);
    const xmlParser = new XMLParser();
    const ownershipDocumentMatch = documentText.match(
      /<ownershipDocument>([\s\S]*?)<\/ownershipDocument>/g,
    );
    if (ownershipDocumentMatch) {
      const xmlContent = ownershipDocumentMatch[0];
      const parsedXml = xmlParser.parse(xmlContent);
      parsed.ownershipDocument =
        this.parserService.normalizeKnownKeysAsAppropriateDataTypes(
          parsedXml.ownershipDocument,
        ) as unknown as Form4Data["ownershipDocument"];
    }
    return parsed;
  }

  public async parseDocumentAndFormatOutput(
    documentText: string,
    url: string,
  ): Promise<ParsedDocument<Form4Data>> {
    const baseDoc =
      await this.baseFilingService.parseDocumentAndFormatOutput(documentText, url);
    const form4 = await this.parseDocument(documentText);
    baseDoc.parsed.ownershipDocument = form4.ownershipDocument;
    return baseDoc;
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
    const baseImpact = this.baseFilingService.assessImpact(
      rawDocumentText,
      parsedDoc,
    );
    return baseImpact;
  }
}
