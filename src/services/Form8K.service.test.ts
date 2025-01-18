import { Form8KService } from "./Form8K.service";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Form8KService", () => {
  let service: Form8KService;
  let sampleFiling: string;

  beforeEach(() => {
    service = new Form8KService();
    sampleFiling = readFileSync(
      join(__dirname, "../../test/test-fixtures/8k-0.txt"),
      "utf-8",
    );
  });

  it("should process an 8-K document correctly", async () => {
    const result = await service.processDocument(sampleFiling);

    expect(result).toEqual({
      derived: {
        acceptanceDatetime: "20180425093712",
        accessionNumber: "0001511164-18-000283",
        dateAsOfChange: "20180425",
        filedAsOfDate: "20180425",
        filingAgent: "MJ Holdings, Inc.",
        submissionType: "8-K",
        publicDocumentCount: "19",
        tradingSymbol: "MJNE",
        unixTimestamp: 1524614400,
      },
      estimatedImpact: {
        confidence: 0.5999968530698304,
        marketImpact: "positive",
        sentiment: 0.0001526902989606649,
        totalScore: 0.000022903544844099735,
      },
      parsed: {
        acceptanceDatetime: "20180425093712",
        accessionNumber: "0001511164-18-000283",
        conformedPeriodOfReport: "20180425",
        conformedSubmissionType: "8-K",
        dateAsOfChange: "20180425",
        filedAsOfDate: "20180425",
        filer: [
          {
            businessAddress: {
              businessPhone: "305-455-1800",
              city: "MIAMI",
              state: "FL",
              street1: "4141 NE 2 AVE",
              street2: "SUITE 204-A",
              zip: "33137",
            },
            companyData: {
              centralIndexKey: "0001456857",
              companyConformedName: "MJ Holdings, Inc.",
              fiscalYearEnd: "1231",
              irsNumber: "208235905",
              standardIndustrialClassification:
                "SERVICES-BUSINESS SERVICES, NEC [7389]",
              stateOfIncorporation: "NV",
            },
            filingValues: {
              filmNumber: "18772968",
              formType: "8-K",
              secAct: "1934 Act",
              secFileNumber: "000-55900",
            },
            formerCompany: [
              {
                dateOfNameChange: "20090223",
                formerConformedName: "Securitas EDGAR Filings, Inc.",
              },
            ],
            mailAddress: {
              city: "MIAMI",
              state: "FL",
              street1: "4141 NE 2 AVE",
              street2: "SUITE 204-A",
              zip: "33137",
            },
          },
        ],
        itemInformation: [
          "Regulation FD Disclosure",
          "Financial Statements and Exhibits",
        ],
        publicDocumentCount: "19",
      },
    });
  });
});
