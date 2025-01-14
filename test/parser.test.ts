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
    expect(res.acceptanceDatetime).toEqual("20180425093712");
    expect(res.filer[0].filingValues.formType).toEqual("8-K");
  });

  test("handles apostrophes", async () => {
    const res = await parser.getObjectFromString(docs[4]);
    expect(res.filer[0].companyData.companyConformedName).toBe(
      "Advisors' Inner Circle Fund III",
    );
  });

  test("Properly parses document 1", async () => {
    const res = await parser.getObjectFromString(docs[1]);
    expect(typeof res.issuer).toBe("object");
    expect(res.reportingOwner[0].ownerData.organizationName).toBe(null);
  });

  test("Properly parses document 2", async () => {
    const res = await parser.getObjectFromString(docs[2]);
    expect(res.filer[0].companyData.irsNumber).toBe("000000000");
  });

  test("Properly parses document 3", async () => {
    const obj = await parser.getObjectFromString(docs[3]);

    expect(
      obj.seriesAndClassesContractsData.existingSeriesAndClassesContracts.series
        .length,
    ).toBe(2);
    expect(obj.filer[0].businessAddress.state).toBe("WI");
  });

  test("Properly parses document 4", async () => {
    const obj = await parser.getObjectFromString(docs[4]);

    expect(
      obj.seriesAndClassesContractsData.existingSeriesAndClassesContracts.series
        .length,
    ).toBe(9);
    expect(obj.filer[0].businessAddress.state).toBe("PA");
  });

  test("Properly parses document 5", async () => {
    const obj = await parser.getObjectFromString(docs[5]);

    expect(obj.filer[0].businessAddress.city).toBe("HONG KONG");
    expect(obj.filer[0].businessAddress.state).toBe("K3");
  });

  test("Properly parses document 6", async () => {
    const obj = await parser.getObjectFromString(docs[6]);
    expect(obj.filer[0].businessAddress.city).toBe("HONG KONG");
    expect(obj.filer[0].businessAddress.state).toBe("K3");
    expect(obj).toEqual({
      acceptanceDatetime: "20231016165638",
      conformedPeriodOfReport: "20230930",
      conformedSubmissionType: "13F-HR",
      dateAsOfChange: "20231016",
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
      publicDocumentCount: "2",
    });
  });
});
