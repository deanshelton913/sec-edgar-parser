import "./ServicesRegistry";
import { container } from "tsyringe";
import type { SecService } from "./services/SecService";
import type { LoggingService } from "./services/LoggingService";

const secService = container.resolve("SecService") as SecService;
const loggingService = container.resolve("LoggingService") as LoggingService;

export const main = async () => {
  loggingService.debug("[MAIN] starting");
  await secService.getRssFeedAndParseAllFilings();
  loggingService.debug(`[MAIN] done`)
};
