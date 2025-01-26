import { Form8KService } from "./Form8KService";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { container } from "tsyringe";

describe("Form8KService", () => {
  let service: Form8KService;
  let sampleFiling: string;

  beforeEach(() => {
    service = container.resolve(Form8KService);
    sampleFiling = readFileSync(
      join(__dirname, "../../test/test-fixtures/form8K.txt"),
      "utf-8",
    );
  });

  it("should process an 8-K document correctly", async () => {
    const result = await service.parseDocumentAndFormatOutput(
      sampleFiling,
      "whatever",
    );

    expect(result).toEqual({
      attachments: [
        "edgar-filings/whatever/exhibit9911.jpg",
        "edgar-filings/whatever/exhibit9912.jpg",
        "edgar-filings/whatever/exhibit9913.jpg",
        "edgar-filings/whatever/exhibit9914.jpg",
        "edgar-filings/whatever/exhibit9915.jpg",
        "edgar-filings/whatever/exhibit9916.jpg",
        "edgar-filings/whatever/exhibit9917.jpg",
        "edgar-filings/whatever/exhibit9918.jpg",
        "edgar-filings/whatever/exhibit9919.jpg",
        "edgar-filings/whatever/exhibit99110.jpg",
        "edgar-filings/whatever/exhibit99111.jpg",
        "edgar-filings/whatever/exhibit99112.jpg",
        "edgar-filings/whatever/exhibit99113.jpg",
        "edgar-filings/whatever/exhibit99114.jpg",
        "edgar-filings/whatever/exhibit99115.jpg",
        "edgar-filings/whatever/exhibit99116.jpg",
      ],
      basic: {
        acceptanceDatetime: 1524663432,
        accessionNumber: "0001511164-18-000283",
        filedAsOfDate: 1524628800,
        submissionType: "8-K",
        publicDocumentCount: "19",
        url: "whatever",
      },
      estimatedImpact: {
        confidence: 0.59999685,
        marketImpact: "neutral",
        sentiment: 0.00015269,
        totalScore: 0.0000229,
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
