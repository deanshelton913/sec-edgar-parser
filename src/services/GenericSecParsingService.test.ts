import { GenericSecParsingService } from "./GenericSecParsingService";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ConsistentDocumentFields,
  ParsedDocument,
} from "../types/filing-output";
import { container } from "tsyringe";

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
  });
});
