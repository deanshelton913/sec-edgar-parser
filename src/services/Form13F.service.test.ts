import { Form13FHrService } from "./Form13F.service";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Form13FHR", () => {
  let service: Form13FHrService;
  let sampleFiling: string;

  beforeEach(() => {
    service = new Form13FHrService();
    sampleFiling = readFileSync(
      join(__dirname, "../../test/test-fixtures/form13f-hr.txt"),
      "utf-8",
    );
  });

  it("should process a Form13F-HR document correctly", async () => {
    const result = await service.processDocument(sampleFiling);

    expect(result).toEqual({
      derived: {
        acceptanceDatetime: 1697489798,
        accessionNumber: "0001172661-23-003414",
        dateAsOfChange: 1697428800,
        filedAsOfDate: 1697428800,
        filingAgent: "OCEAN ARETE LTD",
        publicDocumentCount: "2",
        submissionType: "13F-HR",
        tradingSymbol: null,
        cusip: "89677Q107",
      },
      estimatedImpact: {
        confidence: 0.02859594,
        marketImpact: "positive",
        sentiment: 0.00503778,
        totalScore: 6305091,
      },
      parsed: {
        acceptanceDatetime: "20231016165638",
        accessionNumber: "0001172661-23-003414",
        conformedPeriodOfReport: "20230930",
        conformedSubmissionType: "13F-HR",
        dateAsOfChange: "20231016",
        edgarSubmission: {
          formData: {
            coverPage: {
              crdNumber: 286314,
              filingManager: {
                address: {
                  "ns1:city": "Hong Kong",
                  "ns1:stateOrCountry": "K3",
                  "ns1:street1": "22th Floor, 8 Queen's Road Central",
                  "ns1:zipCode": "-",
                },
                name: "OCEAN ARETE LTD",
              },
              form13FFileNumber: "028-19239",
              isAmendment: false,
              provideInfoForInstruction5: "N",
              reportCalendarOrQuarter: "09-30-2023",
              reportType: "13F HOLDINGS REPORT",
              secFileNumber: "802-110713",
            },
            signatureBlock: {
              city: "Hong Kong",
              name: "Zemin Li",
              phone: "852-3468-8355",
              signature: "/s/ Zemin Li",
              signatureDate: "10-16-2023",
              stateOrCountry: "K3",
              title: "CIO and Director",
            },
            summaryPage: {
              otherIncludedManagersCount: 0,
              tableEntryTotal: 1,
              tableValueTotal: 6305091,
            },
          },
          headerData: {
            filerInfo: {
              filer: [
                {
                  credentials: {
                    ccc: "XXXXXXXX",
                    cik: 1766724,
                  },
                },
              ],
              flags: {
                confirmingCopyFlag: false,
                overrideInternetFlag: false,
                returnCopyFlag: false,
              },
              liveTestFlag: "LIVE",
              periodOfReport: "09-30-2023",
            },
            submissionType: "13F-HR",
          },
          schemaVersion: "X0202",
        },
        effectivenessDate: "20231016",
        filedAsOfDate: "20231016",
        filer: [
          {
            businessAddress: {
              businessPhone: "852 3468 8355",
              city: "HONG KONG",
              state: "K3",
              street1: "22TH FLOOR, 8 QUEEN'S ROAD CENTRAL",
              zip: "-",
            },
            companyData: {
              centralIndexKey: "0001766724",
              companyConformedName: "OCEAN ARETE LTD",
              fiscalYearEnd: "1231",
              irsNumber: "000000000",
              stateOfIncorporation: "K3",
            },
            filingValues: {
              filmNumber: "231327795",
              formType: "13F-HR",
              secAct: "1934 Act",
              secFileNumber: "028-19239",
            },
            mailAddress: {
              city: "HONG KONG",
              state: "K3",
              street1: "22TH FLOOR, 8 QUEEN'S ROAD CENTRAL",
              zip: "-",
            },
          },
        ],
        infoTable: {
          cusip: "89677Q107",
          investmentDiscretion: "SOLE",
          nameOfIssuer: "TRIP COM GROUP LTD",
          shrsOrPrnAmt: {
            sshPrnamt: 180300,
            sshPrnamtType: "SH",
          },
          titleOfClass: "ADS",
          value: 6305091,
          votingAuthority: {
            None: 0,
            Shared: 0,
            Sole: 180300,
          },
        },
        publicDocumentCount: "2",
      },
    });
  });
});
