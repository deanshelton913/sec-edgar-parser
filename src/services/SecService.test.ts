import { HttpService } from "./HttpService";
import { SecService } from "./SecService";
import { container } from "tsyringe";
import fs from "node:fs";

describe("SecService", () => {
  let service: SecService;
  let httpService: HttpService;

  beforeEach(() => {
    httpService = container.resolve(HttpService);
    container.registerInstance(HttpService, httpService);
    service = container.resolve(SecService);
    jest
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .spyOn(service as any, "makeRequestToGetSingleFiling")
      .mockResolvedValue(
        fs.readFileSync("test/test-fixtures/form4.txt", "utf-8"),
      );
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    jest.spyOn(service as any, "makeRequestToGetRssFeed").mockResolvedValue(
      `<?xml version="1.0" encoding="ISO-8859-1" ?>
    <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Latest Filings - Tue, 21 Jan 2025 19:57:56 EST</title>
        <link rel="alternate" href="/cgi-bin/browse-edgar?action=getcurrent"/>
        <link rel="self" href="/cgi-bin/browse-edgar?action=getcurrent"/>
        <id>https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent</id>
        <author><name>Webmaster</name><email>webmaster@sec.gov</email></author>
        <updated>2025-01-21T19:57:56-05:00</updated>
        <entry>
            <title>WHOCARES</title>
            <link rel="alternate" type="text/html" href="https://SEC_URL_GOES_HERE.com/banana-index.htm"/>
            <summary type="html">
                Summary goes here
            </summary>
            <updated>2025-01-21T19:46:38-05:00</updated>
            <category scheme="https://www.sec.gov/" label="form type" term="4"/>
            <id>urn:tag:sec.gov,2008:accession-number=0000950170-25-007473</id>
        </entry>
    </feed>`,
    );
  });

  it("should process all SEC filings correctly", async () => {
    const rssFeed = await service.getRssFeedAndParseAllFilings();

    expect(rssFeed).toEqual({
      parsedFilings: [
        {
          attachments: [],
          basic: {
            url: "https://SEC_URL_GOES_HERE.com/banana.txt",
            acceptanceDatetime: 1714583242,
            accessionNumber: "0000842517-24-000086",
            filedAsOfDate: 1714536000,
            publicDocumentCount: "1",
            submissionType: "4",
          },
          estimatedImpact: {
            confidence: 0.6,
            marketImpact: "neutral",
            sentiment: 0.02277904,
            totalScore: 0.0022779,
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
                  standardIndustrialClassification:
                    "STATE COMMERCIAL BANKS [6022]",
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
                  issuerCik: "0000842517",
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
                    rptOwnerCik: "0001849440",
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
        },
      ],
      unparsedFilings: [],
    });
  });
});
