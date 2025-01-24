import { main } from "./main";
import { container } from "tsyringe";
import type { LoggingService } from "./services/LoggingService";

const loggingService = container.resolve("LoggingService") as LoggingService;
main()
  .catch((e) => {
    loggingService.error(`[MAIN] FATAL ERROR: ${e}`);
  })
  .then(() => {
    loggingService.debug("[MAIN] done");
  });
