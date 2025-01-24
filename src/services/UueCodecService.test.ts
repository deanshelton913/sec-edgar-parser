import * as fs from "node:fs";
import * as path from "node:path";
import { UueCodecService } from "./UueCodecService";
import { StorageService } from "./StorageService";
import { container } from "tsyringe";

describe("UueCodecService", () => {
  const uueCodecService = container.resolve(UueCodecService);
  const storageService = container.resolve(StorageService);
  beforeEach(() => {});
  it("should decode the schedule13g.txt file", async () => {
    // Read the schedule13g.txt file
    const filePath = path.join(
      __dirname,
      "../",
      "../",
      "test",
      "test-fixtures",
      "schedule13g.txt",
    );
    const encodedText = fs.readFileSync(filePath, "utf-8");
    const decodedFiles = uueCodecService.decodeUuEncodedFiles(encodedText);
    for (const file of decodedFiles) {
      await storageService.writeFile(file.name, file.data);
    }
  });
});
