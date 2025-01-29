import Parser from "rss-parser";
import { injectable } from "tsyringe";

export interface EdgarFilingRssFeed {
  title: string;
  link: string;
  id: string;
  author: { name: string; email: string };
  updated: string;
  items: EdgarFilingRssFeedItem[];
}

export type FilingTypes =
  | "SCHEDULE 13G/A"
  | "SCHEDULE 13D/A"
  | "4"
  | "8-K"
  | "4/A"
  | "13F-HR";

export interface EdgarFilingRssFeedItem {
  title: string;
  link: string;
  summary: string;
  updated: string;
  category: { $: { scheme: string; label: string; term: FilingTypes } };
  id: string;
}

/**
 * RssService is responsible for parsing RSS feeds related to SEC filings
 * and creating new RSS feeds based on provided options and items. It utilizes
 * the rss-parser library to handle the parsing of RSS feed XML strings and
 * the rss library to generate RSS feed XML from given data. The service
 * ensures that the necessary headers and custom fields are set for proper
 * parsing and feed creation.
 */
@injectable()
export class RssService {
  private rssParser: Parser<EdgarFilingRssFeed, EdgarFilingRssFeedItem>;

  constructor() {
    this.rssParser = new Parser({
      headers: {
        "User-Agent": "Sigilant LLC. deanshelton913@gmail.com",
        "Accept-Encoding": "gzip, deflate",
        Host: "www.sec.gov",
      },
      customFields: {
        feed: ["title", "link", "id", "author", "updated"],
        item: ["title", "link", "summary", "updated", "category", "id"],
      },
    });
  }

  public async parseString(xml: string) {
    return this.rssParser.parseString(xml);
  }
}
