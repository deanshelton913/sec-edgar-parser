export interface Form13FFiling {
  // Document Header Fields
  acceptanceDatetime: string; // ACCEPTANCE-DATETIME
  secDocument: string; // SEC-DOCUMENT
  secHeaderContent: string; // SEC-HEADER
  documentCount: number; // DOCUMENT-COUNT

  // Submission Header Fields
  filingDate: string; // FILED-DATE
  filmNumber: string; // FILM-NUMBER
  type: "13F-HR" | "13F-NT" | "13F-HR/A" | "13F-NT/A"; // TYPE
  publicDocumentCount: number; // PUBLIC-DOCUMENT-COUNT

  // Filer Information
  filerInfo: {
    cik: string; // FILER CIK
    irsNumber?: string; // IRS-NUMBER
    name: string; // COMPANY CONFORMED NAME
    fileNumber: string; // FILE-NUMBER
    stateOfIncorporation: string; // STATE OF INCORPORATION
    fiscalYearEnd: string; // FISCAL-YEAR-END
    businessAddress: {
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
      businessPhone: string;
    };
  };

  // Form-Specific Content
  reportCalendarPeriod: string; // CONFORMED PERIOD OF REPORT
  reportType: "13F HOLDINGS REPORT" | "13F NOTICE" | "13F COMBINATION REPORT";
  isAmendment: boolean;
  amendmentNumber?: number; // AMENDMENT NUMBER
  amendmentDescription?: string;
  confidentialOmitted: boolean; // Whether confidential information has been omitted
  holdings: Form13FHolding[];
  totalHoldingsValue: number; // in thousands of dollars

  // Footer Information
  signatureName: string; // SIGNATURE-NAME
  signatureDate: string; // SIGNATURE-DATE
  signatureTitle: string; // SIGNATURE-TITLE
}

interface Form13FHolding {
  nameOfIssuer: string;
  titleOfClass: string;
  cusip: string;
  value: number; // in thousands of dollars
  sharesOrPrincipalAmount: {
    amount: number;
    type: "SH" | "PRN"; // SH = Shares, PRN = Principal Amount
  };
  investmentDiscretion: "SOLE" | "SHARED" | "NONE";
  votingAuthority: {
    sole: number;
    shared: number;
    none: number;
  };
  putCall?: "PUT" | "CALL"; // Only for options
  otherManager?: string; // Reference to other manager if shared investment discretion
  confidentialOmitted?: boolean; // Indicates if confidential info is omitted for this holding
}
