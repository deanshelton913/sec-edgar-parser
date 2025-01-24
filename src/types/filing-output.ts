import type { Form8KData } from "./form8k.types";
import type { Form4Data } from "./form4.types";
import type { Form13FFiling } from "./form13f.types";

export type ParsedDocumentTypes = Form8KData | Form4Data | Form13FFiling;

export interface ParsedDocument<T extends ConsistentDocumentFields> {
  // Common SEC filing header fields
  basic: {
    accessionNumber: string;
    acceptanceDatetime: number;
    conformedSubmissionType: string;
    publicDocumentCount: string;
    filedAsOfDate: number;
    dateAsOfChange: string;
    unixTimestamp: number;
    submissionType: string;
    url: string;
  };
  estimatedImpact: {
    marketImpact: "positive" | "negative" | "neutral";
    confidence: number;
    totalScore: number;
    sentiment: number;
  };
  parsed: T;
  attachments?: string[];
}

export interface ConsistentDocumentFields {
  accessionNumber: string;
  acceptanceDatetime: string;
  conformedSubmissionType: string;
  publicDocumentCount: string;
  filedAsOfDate: string;
  unixTimestamp: number;
}
