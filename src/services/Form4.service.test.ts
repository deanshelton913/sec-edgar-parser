import { Form4Service } from "./Form4.service";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Form4Service", () => {
  let service: Form4Service;
  let sampleFiling: string;

  beforeEach(() => {
    service = new Form4Service();
    sampleFiling = readFileSync(
      join(__dirname, "../../test/test-fixtures/form4.txt"),
      "utf-8",
    );
  });

  it("should process an form4 document correctly", async () => {
    const result = await service.processDocument(sampleFiling);

    expect(result).toEqual({
      derived: {
        acceptanceDatetime: 1714568842,
        accessionNumber: "0000842517-24-000086",
        dateAsOfChange: 1714521600,
        filedAsOfDate: 1714521600,
        filingAgent: "ISABELLA BANK Corp",
        publicDocumentCount: "1",
        submissionType: "4",
        tradingSymbol: "ISBA",
      },
      estimatedImpact: {
        confidence: 0.6,
        marketImpact: "positive",
        sentiment: 0.022779043280182234,
        totalScore: 0.0022779043280182236,
      },
      parsed: {
        acceptanceDatetime: "20240501130722",
        accessionNumber: "0000842517-24-000086",
        conformedPeriodOfReport: "20240429",
        conformedSubmissionType: "4",
        dateAsOfChange: "20240501",
        filedAsOfDate: "20240501",
        issuer: [
          {
            businessAddress: {
              businessPhone: "9897729471",
              city: "MT PLEASANT",
              state: "MI",
              street1: "401 NORTH MAIN STREET",
              zip: "48858",
            },
            companyData: {
              centralIndexKey: "0000842517",
              companyConformedName: "ISABELLA BANK Corp",
              fiscalYearEnd: "1231",
              irsNumber: "382830092",
              organizationName: "02 Finance",
              standardIndustrialClassification: "STATE COMMERCIAL BANKS [6022]",
              stateOfIncorporation: "MI",
            },
            formerCompany: [
              {
                dateOfNameChange: "20080602",
                formerConformedName: "ISABELLA BANK CORP",
              },
              {
                dateOfNameChange: "19920703",
                formerConformedName: "IBT BANCORP INC /MI/",
              },
            ],
            mailAddress: {
              city: "MT PLEASANT",
              state: "MI",
              street1: "401 NORTH MAIN STREET",
              zip: "48858",
            },
          },
        ],
        ownershipDocument: {
          aff10b5One: 0,
          derivativeTable: "",
          documentType: 4,
          footnotes: {
            footnote:
              "Includes shares acquired through quarterly dividend reinvestment.",
          },
          issuer: [
            {
              issuerCik: 842517,
              issuerName: "ISABELLA BANK Corp",
              issuerTradingSymbol: "ISBA",
            },
          ],
          nonDerivativeTable: {
            nonDerivativeHolding: [
              {
                ownershipNature: {
                  directOrIndirectOwnership: {
                    value: "I",
                  },
                  natureOfOwnership: {
                    value: "Held by minor child",
                  },
                },
                postTransactionAmounts: {
                  sharesOwnedFollowingTransaction: {
                    footnoteId: "",
                    value: 2170.3157,
                  },
                },
                securityTitle: {
                  value: "common",
                },
              },
              {
                ownershipNature: {
                  directOrIndirectOwnership: {
                    value: "I",
                  },
                  natureOfOwnership: {
                    value: "Held by LLC",
                  },
                },
                postTransactionAmounts: {
                  sharesOwnedFollowingTransaction: {
                    footnoteId: "",
                    value: 383262.5326,
                  },
                },
                securityTitle: {
                  value: "common",
                },
              },
            ],
            nonDerivativeTransaction: {
              ownershipNature: {
                directOrIndirectOwnership: {
                  value: "D",
                },
              },
              postTransactionAmounts: {
                sharesOwnedFollowingTransaction: {
                  footnoteId: "",
                  value: 15711.8844,
                },
              },
              securityTitle: {
                value: "common",
              },
              transactionAmounts: {
                transactionAcquiredDisposedCode: {
                  value: "A",
                },
                transactionPricePerShare: {
                  value: 18.14,
                },
                transactionShares: {
                  value: 275.634,
                },
              },
              transactionCoding: {
                equitySwapInvolved: 0,
                transactionCode: "P",
                transactionFormType: 4,
              },
              transactionDate: {
                value: "2024-04-29",
              },
            },
          },
          notSubjectToSection16: 0,
          ownerSignature: {
            signatureDate: "2024-05-01",
            signatureName: "/s/ Jennifer L. Gill, By Power of Attorney",
          },
          periodOfReport: "2024-04-29",
          remarks: "",
          reportingOwner: [
            {
              reportingOwnerAddress: {
                rptOwnerCity: "MT. PLEASANT",
                rptOwnerState: "MI",
                rptOwnerStateDescription: "",
                rptOwnerStreet1: "770 STONERIDGE DR.",
                rptOwnerStreet2: "",
                rptOwnerZipCode: 48858,
              },
              reportingOwnerId: {
                rptOwnerCik: 1849440,
                rptOwnerName: "McGuirk Richard L",
              },
              reportingOwnerRelationship: {
                isDirector: 1,
                isOfficer: 0,
                isOther: 0,
                isTenPercentOwner: 0,
              },
            },
          ],
          schemaVersion: "X0508",
        },
        publicDocumentCount: "1",
        reportingOwner: [
          {
            filingValues: {
              filmNumber: "24901899",
              formType: "4",
              secAct: "1934 Act",
              secFileNumber: "000-18415",
            },
            mailAddress: {
              city: "MT. PLEASANT",
              state: "MI",
              street1: "770 STONERIDGE DR.",
              zip: "48858",
            },
            ownerData: {
              centralIndexKey: "0001849440",
              companyConformedName: "McGuirk Richard L",
              organizationName: null,
            },
          },
        ],
      },
    });
  });
});
