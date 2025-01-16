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
      filingId: "0001511164-18-000283",
      timestamp: 1524614400,
      companyName: "MJ Holdings, Inc.",
      companyTicker: "MJNE",
      filingType: "8-K",
      significance: "medium",
      estimatedImpact: {
        confidence: 0.6999889857444064,
        itemWeights: {
          "7.01": 0.2,
          "9.01": 0.1,
        },
        marketImpact: "positive",
        sentiment: 0.0001526902989606649,
        totalScore: 0.000022903544844099735,
      },
    });
  });
});
