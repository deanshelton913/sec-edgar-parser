import { type ILogObj, Logger } from "tslog";
import { injectable } from "tsyringe";

const log: Logger<ILogObj> = new Logger({
  type: "pretty",
  stylePrettyLogs: false,
  prettyLogTemplate: "[{{logLevelName}}]",
});

@injectable()
export class LoggingService {
  private client: Logger<ILogObj>;
  constructor() {
    this.client = log;
  }
  public debug(...params: unknown[]) {
    this.client.debug(params.join(" "));
  }
  public error(...params: unknown[]) {
    this.client.error(params.join(" "));
  }
  public warn(...params: unknown[]) {
    this.client.warn(params.join(" "));
  }
}
