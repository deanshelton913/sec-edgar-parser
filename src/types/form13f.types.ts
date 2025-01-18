import type { ConsistentDocumentFields } from "./filing-output";

export interface Form13FFiling extends ConsistentDocumentFields {
  // Document Header Fields
  acceptanceDatetime: string; // ACCEPTANCE-DATETIME
  secDocument: string; // SEC-DOCUMENT
  secHeaderContent: string; // SEC-HEADER
  documentCount: number; // DOCUMENT-COUNT

  // Submission Header Fields
  filingDate: string; // FILED-DATE
  filmNumber: string; // FILM-NUMBER
  type: "13F-HR" | "13F-NT" | "13F-HR/A" | "13F-NT/A"; // TYPE
  publicDocumentCount: string; // PUBLIC-DOCUMENT-COUNT
  edgarSubmission: {
    headerData: {
      submissionType: string;
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
    };
    formData: {
      coverPage: {
        reportCalendarOrQuarter: string;
        isAmendment: boolean;
        amendmentNumber?: number; // AMENDMENT NUMBER
        filingManager: {
          name: string;
          address: {
            street1: string;
            city: string;
            stateOrCountry: string;
            zipCode: string;
          };
        };
        reportType:
          | "13F HOLDINGS REPORT"
          | "13F NOTICE"
          | "13F COMBINATION REPORT";
        form13FFileNumber: string;
        crdNumber: string;
        secFileNumber: string;
        provideInfoForInstruction5: string;
      };
      signatureBlock: {
        name: string;
        title: string;
        phone: string;
        signature: string;
        city: string;
        stateOrCountry: string;
        signatureDate: string;
      };
      summaryPage: {
        otherIncludedManagersCount: number;
        tableEntryTotal: number;
        tableValueTotal: number;
      };
    };
  };
  infoTable: {
    nameOfIssuer: string;
    titleOfClass: string;
    cusip: string;
    value: number;
    shrsOrPrnAmt: {
      sshPrnamt: number;
      sshPrnamtType: "SH" | "PRN"; // SH = Shares, PRN = Principal Amount
    };
    investmentDiscretion: "SOLE" | "SHARED" | "NONE";
    votingAuthority: {
      Sole: number;
      Shared: number;
      None: number;
    };
  };
}

// interface Form13FHolding {
//   nameOfIssuer: string;
//   titleOfClass: string;
//   cusip: string;
//   value: number; // in thousands of dollars
//   sharesOrPrincipalAmount: {
//     amount: number;
//     type: "SH" | "PRN"; // SH = Shares, PRN = Principal Amount
//   };
//   investmentDiscretion: "SOLE" | "SHARED" | "NONE";
//   votingAuthority: {
//     sole: number;
//     shared: number;
//     none: number;
//   };
//   putCall?: "PUT" | "CALL"; // Only for options
//   otherManager?: string; // Reference to other manager if shared investment discretion
//   confidentialOmitted?: boolean; // Indicates if confidential info is omitted for this holding
// }
