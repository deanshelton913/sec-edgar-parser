import { Form13FHrService } from "./Form13FHrService";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { container } from "tsyringe";

describe("Schedule13G", () => {
  let service: Form13FHrService;
  let sampleFiling: string;

  beforeEach(() => {
    service = container.resolve(Form13FHrService);

    sampleFiling = readFileSync(
      join(__dirname, "../../test/test-fixtures/schedule13g.txt"),
      "utf-8",
    );
  });

  it("should process a Schedule13G document correctly", async () => {
    const result = await service.parseDocumentAndFormatOutput(
      sampleFiling,
      "whatever",
    );

    expect(result).toEqual({
      attachments: ["undefined/acmex99ftlf.pdf"],
      basic: {
        acceptanceDatetime: 1737165458,
        accessionNumber: "0001815572-25-000002",
        filedAsOfDate: 1737086400,
        publicDocumentCount: "3",
        submissionType: "SCHEDULE 13G",
        url: "whatever",
      },
      estimatedImpact: {
        confidence: 0.59998262,
        marketImpact: "neutral",
        sentiment: 0.00098202,
        totalScore: 0.0000982,
      },
      parsed: {
        acceptanceDatetime: "20250117215738",
        accessionNumber: "0001815572-25-000002",
        conformedSubmissionType: "SCHEDULE 13G",
        edgarSubmission: {
          formData: {
            coverPageHeader: {
              designateRulesPursuantThisScheduleFiled: {
                designateRulePursuantThisScheduleFiled: "Rule 13d-1(c)",
              },
              eventDateRequiresFilingThisStatement: "01/15/2025",
              issuerInfo: {
                issuerCik: "0001374328",
                issuerCusip: "33817P306",
                issuerName: "FITLIFE BRANDS, INC.",
                issuerPrincipalExecutiveOfficeAddress: {
                  "com:city": "OMAHA",
                  "com:stateOrCountry": "NE",
                  "com:street1": "5214 S. 136TH STREET",
                  "com:zipCode": 68137,
                },
              },
              securitiesClassTitle: "Common Stock, Par Value $0.01 Per Share",
            },
            coverPageHeaderReportingPersonDetails: [
              {
                citizenshipOrOrganization: "TX",
                classPercent: 5.1,
                memberGroup: "b",
                reportingPersonBeneficiallyOwnedAggregateNumberOfShares: 233990,
                reportingPersonBeneficiallyOwnedNumberOfShares: {
                  sharedDispositivePower: 233990,
                  sharedVotingPower: 233990,
                  soleDispositivePower: 0,
                  soleVotingPower: 0,
                },
                reportingPersonName: "ASKELADDEN CAPITAL MANAGEMENT LLC",
                typeOfReportingPerson: ["PN", "IA"],
              },
              {
                citizenshipOrOrganization: "X1",
                classPercent: 5.1,
                memberGroup: "b",
                reportingPersonBeneficiallyOwnedAggregateNumberOfShares: 233990,
                reportingPersonBeneficiallyOwnedNumberOfShares: {
                  sharedDispositivePower: 233990,
                  sharedVotingPower: 233990,
                  soleDispositivePower: 0,
                  soleVotingPower: 0,
                },
                reportingPersonName: "Samir Patel",
                typeOfReportingPerson: ["IN", "HC"],
              },
            ],
            items: [
              {
                item1: {
                  issuerName: "FITLIFE BRANDS, INC.",
                  issuerPrincipalExecutiveOfficeAddress:
                    "5214 S. 136TH STREET, OMAHA, NEBRASKA, 68137",
                },
                item10: {
                  certifications:
                    "By signing below I certify that, to the best of my knowledge and belief, the securities referred to above were not acquired and are not held for the purpose of or with the effect of changing or influencing the control of the issuer of the securities and were not acquired and are not held in connection with or as a participant in any transaction having that purpose or effect, other than activities solely in connection with a nomination under &#167; 240.14a-11.",
                  notApplicableFlag: "N",
                },
                item2: {
                  citizenship: "See Item 4 on the cover page(s) hereto.",
                  filingPersonName: `This statement is being jointly filed by and on behalf of each of Askeladden Capital Management, LLC, a Texas limited liability company ('Askeladden') and Samir Patel.

The separately managed accounts on behalf of investment advisory clients ('Managed Accounts') of Askeladden are the record and direct beneficial owners of the securities covered by this statement. As the investment adviser to the Managed Accounts, Askeladden may be deemed to beneficially own the securities covered by this statement. Mr. Patel is the Member of, and may be deemed to beneficially own securities owned by, Askeladden.

Each reporting person declares that neither the filing of this statement nor anything herein shall be construed as an admission that such person is, for the purposes of Section 13(d) or 13(g) of the Act or any other purpose, the beneficial owner of any securities covered by this statement.

Each reporting person may be deemed to be a member of a group with respect to the issuer or securities of the issuer for the purposes of Section 13(d) or 13(g) of the Act. Each reporting person declares that neither the filing of this statement nor anything herein shall be construed as an admission that such person is, for the purposes of Section 13(d) or 13(g) of the Act or any other purpose, (i) acting (or has agreed or is agreeing to act together with any other person) as a partnership, limited partnership, syndicate, or other group for the purpose of acquiring, holding, or disposing of securities of the issuer or otherwise with respect to the issuer or any securities of the issuer or (ii) a member of any group with respect to the issuer or any securities of the issuer.`,
                  principalBusinessOfficeOrResidenceAddress:
                    "1452 Hughes Road, Suite 200 #582, Grapevine, Texas 76051",
                },
                item3: {
                  notApplicableFlag: "Y",
                },
                item4: {
                  amountBeneficiallyOwned:
                    "See Item 9 on the cover page(s) hereto.",
                  classPercent:
                    "The percentage calculated in Item 11 is based on 4,598,241 shares of Common Stock outstanding as of November 13, 2024, as reported in the Issuer's Quarterly Report on Form 10-Q for the quarter ended September 30, 2024, and as filed with the SEC on November 14, 2024.",
                  numberOfSharesPersonHas: {
                    sharedPowerOrDirectToDispose:
                      "See Item 8 on the cover page(s) hereto.",
                    sharedPowerOrDirectToVote:
                      "See Item 6 on the cover page(s) hereto.",
                    solePowerOrDirectToDispose:
                      "See Item 7 on the cover page(s) hereto.",
                    solePowerOrDirectToVote:
                      "See Item 5 on the cover page(s) hereto.",
                  },
                },
                item5: {
                  classOwnership5PercentOrLess: "N",
                  notApplicableFlag: "Y",
                },
                item6: {
                  notApplicableFlag: "Y",
                },
                item7: {
                  notApplicableFlag: "Y",
                },
                item8: {
                  notApplicableFlag: "Y",
                },
                item9: {
                  notApplicableFlag: "Y",
                },
              },
            ],
            signatureInformation: [
              {
                reportingPersonName: "ASKELADDEN CAPITAL MANAGEMENT LLC",
                signatureDetails: {
                  date: "01/17/2025",
                  signature: "/s/ Samir Patel",
                  title: "Managing Member",
                },
              },
              {
                reportingPersonName: "Samir Patel",
                signatureDetails: {
                  date: "01/17/2025",
                  signature: "/s/ Samir Patel",
                  title:
                    "Managing Member of Askeladden Capital Management, LLC",
                },
              },
            ],
          },
          headerData: {
            filerInfo: {
              filer: [
                {
                  filerCredentials: {
                    ccc: "XXXXXXXX",
                    cik: "0001815572",
                  },
                },
              ],
              liveTestFlag: "LIVE",
            },
            submissionType: "SCHEDULE 13G",
          },
        },
        filedAsOfDate: "20250117",
        filedBy: [
          {
            businessAddress: {
              businessPhone: "682-553-8302",
              city: "GRAPEVINE",
              state: "TX",
              street1: "1452 HUGHES ROAD",
              street2: "SUITE 200 #582",
              zip: "76051",
            },
            companyData: {
              centralIndexKey: "0001815572",
              companyConformedName: "ASKELADDEN CAPITAL MANAGEMENT LLC",
              fiscalYearEnd: "1231",
              irsNumber: "810803834",
              organizationName: null,
              stateOfIncorporation: "TX",
            },
            filingValues: {
              formType: "SCHEDULE 13G",
            },
            mailAddress: {
              city: "GRAPEVINE",
              state: "TX",
              street1: "1452 HUGHES ROAD",
              street2: "SUITE 200 #582",
              zip: "76051",
            },
          },
        ],
        publicDocumentCount: "3",
        subjectCompany: [
          {
            businessAddress: {
              businessPhone: "402-884-1894",
              city: "OMAHA",
              state: "NE",
              street1: "5214 S. 136TH STREET",
              zip: "68137",
            },
            companyData: {
              centralIndexKey: "0001374328",
              companyConformedName: "FITLIFE BRANDS, INC.",
              fiscalYearEnd: "1231",
              irsNumber: "000000000",
              organizationName: "03 Life Sciences",
              standardIndustrialClassification:
                "MEDICINAL CHEMICALS & BOTANICAL PRODUCTS [2833]",
              stateOfIncorporation: "NV",
            },
            filingValues: {
              filmNumber: "25540215",
              formType: "SCHEDULE 13G",
              secAct: "1934 Act",
              secFileNumber: "005-84096",
            },
            formerCompany: [
              {
                dateOfNameChange: "20060831",
                formerConformedName: "BOND LABORATORIES, INC.",
              },
            ],
            mailAddress: {
              city: "OMAHA",
              state: "NE",
              street1: "5214 S. 136TH STREET",
              zip: "68137",
            },
          },
        ],
      },
    });
  });
});
