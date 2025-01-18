export interface ParsedDocument<T extends ConsistentDocumentFields> {
  // Common SEC filing header fields
  derived: {
    accessionNumber: string;
    acceptanceDatetime: number;
    conformedSubmissionType: string;
    publicDocumentCount: string;
    filedAsOfDate: number;
    dateAsOfChange: string;
    unixTimestamp: number;
    filingAgent: string;
    tradingSymbol: string | null;
    submissionType: string;
  };
  estimatedImpact: {
    marketImpact: "positive" | "negative" | "neutral";
    confidence: number;
    totalScore: number;
    sentiment: number;
  };
  parsed: T;
}

export interface ConsistentDocumentFields {
  accessionNumber: string;
  acceptanceDatetime: string;
  conformedSubmissionType: string;
  publicDocumentCount: string;
  filedAsOfDate: string;
  dateAsOfChange: string;
  unixTimestamp: number;
}
