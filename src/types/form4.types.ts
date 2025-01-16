import type { TransactionCode, OwnershipType } from "./filing.enums";

export interface Form4Filing {
  // Document Header Fields
  acceptanceDatetime: string; // ACCEPTANCE-DATETIME
  secDocument: string; // SEC-DOCUMENT
  secHeaderContent: string; // SEC-HEADER
  documentCount: number; // DOCUMENT-COUNT

  // Submission Header Fields
  filingDate: string; // FILED-DATE
  filmNumber: string; // FILM-NUMBER
  type: "4"; // TYPE
  publicDocumentCount: number; // PUBLIC-DOCUMENT-COUNT

  // Issuer Information
  issuer: {
    cik: string; // ISSUER CIK
    irsNumber?: string; // IRS-NUMBER
    companyName: string; // COMPANY CONFORMED NAME
    tradingSymbol: string; // TRADING SYMBOL
    fileNumber: string; // FILE-NUMBER
    incorporationState: string; // STATE OF INCORPORATION
  };

  // Reporting Owner Information
  reportingOwner: {
    cik: string; // REPORTING-OWNER CIK
    name: string; // REPORTING-OWNER NAME
    address: {
      street1: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
    relationship: {
      isDirector: boolean; // REPORTING-OWNER RELATIONSHIP DIRECTOR
      isOfficer: boolean; // REPORTING-OWNER RELATIONSHIP OFFICER
      isTenPercentOwner: boolean; // REPORTING-OWNER RELATIONSHIP 10% OWNER
      isOther: boolean; // REPORTING-OWNER RELATIONSHIP OTHER
      officerTitle?: string; // REPORTING-OWNER OFFICER-TITLE
    };
  };

  // Transaction Information
  nonDerivativeTable?: {
    transactions: NonDerivativeTransaction[];
    holdings: NonDerivativeHolding[];
  };
  derivativeTable?: {
    transactions: DerivativeTransaction[];
    holdings: DerivativeHolding[];
  };

  // Footer Information
  signatureName: string; // SIGNATURE-NAME
  signatureDate: string; // SIGNATURE-DATE
  remarks?: string; // REMARKS
}

interface NonDerivativeTransaction {
  securityTitle: string;
  transactionDate: string;
  deemedExecutionDate?: string;
  transactionCode: TransactionCode;
  transactionShares: number;
  transactionPricePerShare: number;
  sharesOwnedFollowingTransaction: number;
  directOrIndirectOwnership: OwnershipType;
  natureOfOwnership?: string;
}

interface NonDerivativeHolding {
  securityTitle: string;
  sharesOwnedFollowingTransaction: number;
  directOrIndirectOwnership: "D" | "I";
  natureOfOwnership?: string;
}

interface DerivativeTransaction {
  securityTitle: string;
  conversionOrExercisePrice: number;
  transactionDate: string;
  deemedExecutionDate?: string;
  transactionCode: TransactionCode;
  transactionShares: number;
  transactionPricePerShare: number;
  exerciseDate: string;
  expirationDate: string;
  underlyingSecurityTitle: string;
  underlyingSecurityShares: number;
  sharesOwnedFollowingTransaction: number;
  directOrIndirectOwnership: "D" | "I";
  natureOfOwnership?: string;
}

interface DerivativeHolding {
  securityTitle: string;
  conversionOrExercisePrice: number;
  exerciseDate: string;
  expirationDate: string;
  underlyingSecurityTitle: string;
  underlyingSecurityShares: number;
  sharesOwnedFollowingTransaction: number;
  directOrIndirectOwnership: "D" | "I";
  natureOfOwnership?: string;
}
