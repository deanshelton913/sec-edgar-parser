import path from "node:path";
import fs from "node:fs";
import * as parser from "../src/parser";

const files = fs.readdirSync(path.join(__dirname, "test-fixtures"));
const numericallySortedFiles = files.sort((a, b) => {
  const numA = Number.parseInt(a.split(".")[0]);
  const numB = Number.parseInt(b.split(".")[0]);
  return numA - numB;
});
const docs = numericallySortedFiles.map((file) => {
  return fs.readFileSync(path.join(__dirname, "test-fixtures", file), "utf-8");
});

describe("SEC EDGAR Parser", () => {
  test("Properly parses document 0", async () => {
    const res = await parser.getObjectFromString(docs[0]);
    expect(res.filer[0].companyData.companyConformedName).toEqual(
      "MJ Holdings, Inc.",
    );
    expect(res.filer[0].filingValues.formType).toEqual("8-K");
  });

  test("includes ACCEPTANCE-DATETIME", async () => {
    const res = await parser.getObjectFromString(docs[0]);
    expect(res.acceptanceDateTime).toEqual("20180425093712");
    expect(res.filer[0].filingValues.formType).toEqual("8-K");
  });
  test.only("handles apostrophes", async () => {
    const res = await parser.getObjectFromString(docs[4]);
    expect(res.filer[0].companyData.companyConformedName).toBe("Advisors' Inner Circle Fund III");

  });
  test("Properly parses document 1", async () => {
    const res = await parser.getObjectFromString(docs[1]);
    expect(typeof res.issuer).toBe("object");
    expect(res.reportingOwner.ownerData.organizationName).toBe(null);
  });

  test("Properly parses document 2", async () => {
    const res = await parser.getObjectFromString(docs[2]);
    expect(res.filer[0].companyData.irsNumber).toBe('000000000');
  });

  test("Properly parses document 3", async () => {
    const obj = await parser.getObjectFromString(docs[3]);

    expect(
      obj.seriesAndClassesContractsData.existingSeriesAndClassesContracts.series
        .length,
    ).toBe(2);
    expect(obj.filer[0].businessAddress.state).toBe("WI");
  });
});
