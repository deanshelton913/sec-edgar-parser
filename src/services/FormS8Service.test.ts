import { FormS8Service } from "./FormS8Service";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { container } from "tsyringe";

describe("FormS8Service", () => {
  let service: FormS8Service;
  let sampleFiling: string;
  describe("FormS8", () => {
    beforeEach(() => {
      service = container.resolve(FormS8Service);
      sampleFiling = readFileSync(
        join(__dirname, "../../test/test-fixtures/formS8.txt"),
        "utf-8",
      );
    });

    it.only("should process an formS8 document correctly", async () => {
      const result = await service.parseDocumentAndFormatOutput(
        sampleFiling,
        "whatever",
      );
      expect(result).toEqual({
        attachments: [
          "undefined/ex5-1_001.jpg",
          "undefined/ex10-21_001.jpg",
          "undefined/ex10-21_002.jpg",
          "undefined/ex10-21_003.jpg",
          "undefined/ex99-1_001.jpg",
          "undefined/ex99-1_002.jpg",
          "undefined/ex99-1_003.jpg",
          "undefined/ex99-2_001.jpg",
          "undefined/ex99-2_002.jpg",
          "undefined/ex99-2_003.jpg",
        ],
        basic: {
          acceptanceDatetime: 1737753789,
          accessionNumber: "0001493152-25-003644",
          filedAsOfDate: 1737691200,
          publicDocumentCount: "26",
          submissionType: "S-8",
          url: "whatever",
        },
        estimatedImpact: {
          confidence: 0.59999745,
          marketImpact: "neutral",
          sentiment: 0.00081462,
          totalScore: 0.00008146,
        },
        parsed: {
          acceptanceDatetime: "20250124172309",
          accessionNumber: "0001493152-25-003644",
          conformedSubmissionType: "S-8",
          dateAsOfChange: "20250124",
          effectivenessDate: "20250124",
          filedAsOfDate: "20250124",
          filer: [
            {
              businessAddress: {
                businessPhone: "585 232 1500",
                city: "HOUSTON",
                state: "TX",
                street1: "1400 BROADFIELD BLVD.",
                street2: "SUITE 130",
                zip: "77084",
              },
              companyData: {
                centralIndexKey: "0001834105",
                companyConformedName: "IMPACT BIOMEDICAL INC.",
                fiscalYearEnd: "1231",
                irsNumber: "853926944",
                organizationName: "03 Life Sciences",
                standardIndustrialClassification:
                  "PHARMACEUTICAL PREPARATIONS [2834]",
                stateOfIncorporation: "NV",
              },
              filingValues: {
                filmNumber: "25555226",
                formType: "S-8",
                secAct: "1933 Act",
                secFileNumber: "333-284502",
              },
              mailAddress: {
                city: "HOUSTON",
                state: "TX",
                street1: "1400 BROADFIELD BLVD.",
                street2: "SUITE 130",
                zip: "77084",
              },
            },
          ],
          ownershipDocument: undefined,
          publicDocumentCount: "26",
        },
      });
    });
  });
});
