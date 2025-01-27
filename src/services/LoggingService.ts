import winston from "winston";
import { injectable } from "tsyringe";

const logger = winston.createLogger({
  silent: process.env.NODE_ENV === "test",
  level: "debug", // Set the default log level for the logger
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to logs
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    // Console Transport for local debugging
    new winston.transports.Console(),
  ],
});

@injectable()
export class LoggingService {
  private client: winston.Logger;
  constructor() {
    this.client = logger;
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
