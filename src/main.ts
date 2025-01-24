import "./ServicesRegistry";
import { container } from "tsyringe";
import type { SecService } from "./services/SecService";
import type { LoggingService } from "./services/LoggingService";
import type { StorageService } from "./services/StorageService";

const secService = container.resolve("SecService") as SecService;
const loggingService = container.resolve("LoggingService") as LoggingService;
const storageService = container.resolve("StorageService") as StorageService;

export const main = async () => {
  loggingService.debug("[MAIN] starting");
  const filings = await secService.getRssFeedAndParseAllFilings();
  for (const filing of filings.parsedFilings) {
    const key = `${storageService.getS3KeyFromSecUrl(filing.basic.url)}.json`;

    await storageService.writeFile(key, JSON.stringify(filing, null, 2));
  }
};
