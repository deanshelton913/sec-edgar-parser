import type { ConsistentDocumentFields, ParsedDocument } from "./filing-output";

export interface Form4Data extends ConsistentDocumentFields {
  ownershipDocument: {
    issuer: {
      issuerCik: string;
      issuerName: string;
      issuerTradingSymbol: string;
    }[];
    reportingOwner: {
      reportingOwnerId: {
        rptOwnerCik: string;
        rptOwnerName: string;
      };
      reportingOwnerAddress: {
        rptOwnerStreet1: string;
        rptOwnerStreet2?: string;
        rptOwnerCity: string;
        rptOwnerState: string;
        rptOwnerZipCode: string;
      };
      reportingOwnerRelationship: {
        isDirector: boolean;
        isOfficer: boolean;
        isTenPercentOwner: boolean;
        isOther: boolean;
        officerTitle?: string;
        otherText?: string;
      };
    }[];
    nonDerivativeTable?: {
      nonDerivativeTransaction: Array<{
        securityTitle: string;
        transactionDate: string;
        transactionCode: string;
        transactionShares: number;
        transactionPricePerShare: number;
        sharesOwnedFollowingTransaction: number;
        directOrIndirectOwnership: string;
      }>;
    };
    derivativeTable?: {
      derivativeTransaction: Array<{
        securityTitle: string;
        conversionOrExercisePrice: number;
        transactionDate: string;
        transactionCode: string;
        transactionShares: number;
        transactionPricePerShare: number;
        exerciseDate: string;
        expirationDate: string;
        underlyingSecurityTitle: string;
        underlyingSecurityShares: number;
      }>;
    };
  };
}

export type Form4Filing = ParsedDocument<Form4Data>;
