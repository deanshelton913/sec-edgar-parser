import { HttpService } from "./HttpService";
import { type EdgarFilingRssFeedItem, RssService } from "./RssService";
import { FormFactoryService } from "./FormFactoryService";
import type { Output } from "rss-parser";
import type {
  ParsedDocument,
  ParsedDocumentTypes,
} from "src/types/filing-output";
import { injectable, inject } from "tsyringe";
import { LoggingService } from "./LoggingService";
import { DynamoDbService } from "./DynamoDBService";
import { StorageService } from "./StorageService";

const DEFAULT_REQUEST_OPTIONS = {
  headers: {
    "User-Agent": "Sigilant LLC. deanshelton913@gmail.com",
    "Accept-Encoding": "gzip, deflate",
    Host: "www.sec.gov",
  },
};
/**
 * SecService is responsible for interacting with the SEC (Securities and Exchange Commission)
 * to retrieve and parse RSS feeds related to SEC filings. It utilizes the HttpService to
 * make HTTP requests to the SEC's RSS feed endpoint and the RssService to parse the
 * retrieved RSS feed data. The service is initialized with a user agent string that is
 * used in the request headers to identify the client making the requests.
 */
@injectable()
export class SecService {
  private baseUrl: string;
  private rssFeedUrl: string;

  /**
   * Initializes the SecService with the provided user agent.
   * It sets up the necessary services and constructs the RSS feed URL.
   *
   * @param userAgent - The user agent string to be used in HTTP requests.
   */
  constructor(
    @inject(HttpService) private httpService: HttpService,
    @inject(FormFactoryService) private formFactoryService: FormFactoryService,
    @inject(RssService) private rssService: RssService,
    @inject(LoggingService) private loggingService: LoggingService,
    @inject(DynamoDbService) private dynamoDbService: DynamoDbService,
    @inject(StorageService) private storageService: StorageService,
  ) {
    this.baseUrl = "https://www.sec.gov/";
    this.rssFeedUrl = `${this.baseUrl}/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=&company=&dateb=&owner=include&start=0&count=40&output=atom`;
  }

  /**
   * Replaces the "-index.htm" part of the filing link with ".txt".
   *
   * @param filing - The filing item containing the link to be modified.
   * @returns The modified link with ".txt" extension.
   */
  private stringReplaceFilingHtmlUrlToTxt(filing: EdgarFilingRssFeedItem) {
    return filing.link.replace("-index.htm", ".txt");
  }

  /**
   * Fetches the SEC filing RSS feed and parses it into a structured format.
   *
   * @returns A promise that resolves to the parsed RSS feed output.
   */
  protected async getSecFilingRssFeed(): Promise<
    Output<EdgarFilingRssFeedItem>
  > {
    const rawRssFeed = await this.makeRequestToGetRssFeed();
    return this.rssService.parseString(rawRssFeed);
  }

  protected async makeRequestToGetRssFeed(): Promise<string> {
    const fileResponse = await this.httpService.get(
      this.rssFeedUrl,
      DEFAULT_REQUEST_OPTIONS,
    );
    return fileResponse.text();
  }

  protected async makeRequestToGetSingleFiling(url: string): Promise<string> {
    const fileResponse = await this.httpService.get(
      url,
      DEFAULT_REQUEST_OPTIONS,
    );
    return fileResponse.text();
  }

  /**
   * Retrieves a single SEC filing based on the provided filing item.
   *
   * @param filing - The filing item for which to fetch the document.
   * @returns A promise that resolves to the raw text of the filing document.
   */
  protected async callSecToGetSingleFiling(
    filing: EdgarFilingRssFeedItem,
  ): Promise<string> {
    const url = this.stringReplaceFilingHtmlUrlToTxt(filing);
    return this.makeRequestToGetSingleFiling(url);
  }

  /**
   * Parses a single SEC filing to produce a structured document.
   *
   * @param filing - The filing item to be parsed.
   * @returns A promise that resolves to the parsed document.
   * @throws FailureByDesign if the filing type is unsupported.
   */
  private async parseSingleFiling(
    filing: EdgarFilingRssFeedItem,
  ): Promise<ParsedDocument<ParsedDocumentTypes>> {
    const filingServiceForType =
      this.formFactoryService.getFilingService(filing);
    const rawSingleFiling = await this.callSecToGetSingleFiling(filing);

    const singleParsedFiling =
      await filingServiceForType?.parseDocumentAndFormatOutput(
        rawSingleFiling,
        this.stringReplaceFilingHtmlUrlToTxt(filing),
      );

    return singleParsedFiling;
  }

  /**
   * Parses all provided SEC filings and returns their structured representations.
   *
   * @param filings - An array of filing items to be parsed.
   * @returns An object containing the parsed filings and any unparsed filings.
   */
  protected async parseAllFilings(
    feedItems: EdgarFilingRssFeedItem[],
  ): Promise<void> {
    for (const feedItem of feedItems) {
      const requestId = await this.httpService.deriveRequestId(
        this.stringReplaceFilingHtmlUrlToTxt(feedItem),
      );
      const filingStatusRecord = await this.dynamoDbService.getFilingStatus(
        feedItem.link,
      );
      if (filingStatusRecord) {
        this.loggingService.debug(
          `[SEC_SERVICE][${requestId}]  Skipping. Already Processed: ${feedItem.link}.`,
        );
        continue; // skip
      }
      this.loggingService.debug(
        `[SEC_SERVICE][${requestId}]  NEW_FILING_FOUND: ${feedItem.link}.`,
      );

      try {
        const parsedFiling = await this.parseSingleFiling(feedItem);
        this.loggingService.debug(
          `[SEC_SERVICE][${requestId}] NEW_FILING_PARSED: (type: ${parsedFiling.basic.submissionType})`,
        );
        const key = `${this.storageService.getS3KeyFromSecUrl(
          parsedFiling.basic.url,
        )}.json`;

        await this.storageService.writeFile(
          key,
          JSON.stringify(parsedFiling, null, 2),
        );
        await this.dynamoDbService.setFilingStatus(feedItem.link, true);
      } catch (error) {
        this.loggingService.error(
          `[SEC_SERVICE][${requestId}] NEW_FILING_FAILED: (type: ${feedItem.category.$.term}) ${feedItem.link}`,
          error,
        );
        await this.dynamoDbService.setFilingStatus(feedItem.link, false);
      }
    }
  }

  public async getRssFeedAndParseAllFilings(): Promise<void> {
    const rssFeed = await this.getSecFilingRssFeed();
    await this.parseAllFilings(rssFeed.items);
  }
}
