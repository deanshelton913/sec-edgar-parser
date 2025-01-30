import { main } from "./main";
import { container } from "tsyringe";
import type { LoggingService } from "./services/LoggingService";

const loggingService = container.resolve("LoggingService") as LoggingService;

exports.handler = async () => {
  try {
    await main();
  } catch (e) {
    loggingService.error(`[MAIN] FATAL ERROR: ${e}`);
    process.exit(1);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success!" }),
  };
};
