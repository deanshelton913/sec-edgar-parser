import { GenericSecParsingService } from "./GenericSecParsingService";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ConsistentDocumentFields,
  ParsedDocument,
} from "../types/filing-output";
import { container } from "tsyringe";
import type { Form8KData } from "src/types/form8k.types";

describe("GenericSecParsingService", () => {
  let service: GenericSecParsingService<
    ParsedDocument<ConsistentDocumentFields>,
    ConsistentDocumentFields
  >;
  describe("ParsedDocument", () => {
    beforeEach(() => {
      service = container.resolve(GenericSecParsingService);
    });

    it("should parse a sf-1a filing without throwing", async () => {
      const sampleFiling = readFileSync(
        join(__dirname, "../../test/test-fixtures/sf-1a.txt"),
        "utf-8",
      );
      expect(() =>
        service.parseDocumentAndFormatOutput(sampleFiling, "some_url"),
      ).not.toThrow();
    });

    it("should parse a 10d filing without throwing", async () => {
      const sampleFiling = readFileSync(
        join(__dirname, "../../test/test-fixtures/10d.txt"),
        "utf-8",
      );
      expect(() =>
        service.parseDocumentAndFormatOutput(sampleFiling, "some_url"),
      ).not.toThrow();
    });
    it("should parse a 13f-nt filing without throwing", async () => {
      const sampleFiling = readFileSync(
        join(__dirname, "../../test/test-fixtures/13f-nt.txt"),
        "utf-8",
      );
      expect(() =>
        service.parseDocumentAndFormatOutput(sampleFiling, "some_url"),
      ).not.toThrow();
    });

    it("should pull company data and filer", async () => {
      const sampleFiling = readFileSync(
        join(__dirname, "../../test/test-fixtures/company-data.txt"),
        "utf-8",
      );
      const doc = await service.parseDocumentAndFormatOutput(
        sampleFiling,
        "some_url",
      );
      expect((doc.parsed as Form8KData).filer).toEqual([
        {
          businessAddress: {
            businessPhone: "313-323-7070",
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            zip: "48126",
          },
          companyData: {
            centralIndexKey: "0001159408",
            companyConformedName: "FORD CREDIT FLOORPLAN MASTER OWNER TRUST A",
            fiscalYearEnd: "1231",
            irsNumber: "386787145",
            organizationName: "Office of Structured Finance",
            standardIndustrialClassification: "ASSET-BACKED SECURITIES [6189]",
            stateOfIncorporation: "DE",
          },
          filingValues: {
            filmNumber: "25563105",
            formType: "SF-3/A",
            secAct: "1933 Act",
            secFileNumber: "333-283567",
          },
          mailAddress: {
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            zip: "48126",
          },
        },
        {
          businessAddress: {
            businessPhone: "313-594-3495",
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            zip: "48126",
          },
          companyData: {
            centralIndexKey: "0000872471",
            companyConformedName: "Ford Credit Floorplan Corp",
            fiscalYearEnd: "1231",
            irsNumber: "382973806",
            organizationName: "Office of Structured Finance",
            standardIndustrialClassification: "ASSET-BACKED SECURITIES [6189]",
            stateOfIncorporation: "DE",
          },
          filingValues: {
            filmNumber: "25563107",
            formType: "SF-3/A",
            secAct: "1933 Act",
            secFileNumber: "333-283567-02",
          },
          formerCompany: [
            {
              dateOfNameChange: "20010731",
              formerConformedName: "FORD CREDIT FLOORPLAN CORP",
            },
            {
              dateOfNameChange: "19921111",
              formerConformedName: "FORD CREDIT AUTO RECEIVABLES CORP",
            },
          ],
          mailAddress: {
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            zip: "48126",
          },
        },
        {
          businessAddress: {
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            street2: "ROOM 1034",
            zip: "48126",
          },
          companyData: {
            centralIndexKey: "0001061198",
            companyConformedName: "FORD CREDIT FLOORPLAN LLC",
            fiscalYearEnd: "1231",
            irsNumber: "383372243",
            organizationName: "Office of Structured Finance",
            standardIndustrialClassification: "ASSET-BACKED SECURITIES [6189]",
            stateOfIncorporation: "DE",
          },
          filingValues: {
            filmNumber: "25563106",
            formType: "SF-3/A",
            secAct: "1933 Act",
            secFileNumber: "333-283567-01",
          },
          mailAddress: {
            city: "DEARBORN",
            state: "MI",
            street1: "ONE AMERICAN ROAD",
            street2: "ROOM 1034",
            zip: "48126",
          },
        },
      ]);
    });
  });
});
