// types/filing-output.ts
export interface FilingOutput {
  filingId: string;
  timestamp: number;
  companyName: string;
  companyTicker: string | null;
  filingType: string;
  relatedEntities?: string[];
  estimatedImpact?: {
    marketImpact?: string;
    stakeholderImpact?: string;
    industryImpact?: string;
  };
}
