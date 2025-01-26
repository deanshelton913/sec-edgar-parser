import winston from "winston";
import CloudWatchTransport from "winston-cloudwatch";
import { injectable } from "tsyringe";
const cloudWatchTransport = new CloudWatchTransport({
  logGroupName: "production-sec-edgar-parser-cron",
  logStreamName: `cron-${new Date().toISOString().slice(0, 10)}`, // e.g., "cron-2025-01-26"
  awsRegion: "us-west-2",
});
const logger = winston.createLogger({
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
    // CloudWatch Transport for logs in AWS
    cloudWatchTransport,
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
  // Flush all logs and clean up transports
  public async flushAndExit(): Promise<void> {
    // Handle CloudWatch flushing specifically
    if (cloudWatchTransport.kthxbye) {
      await new Promise<void>((resolve) => {
        cloudWatchTransport.kthxbye(() => {
          resolve();
        });
      });
    }

    // Wait for Winston to flush any remaining logs
    await new Promise<void>((resolve) => {
      this.client.end(() => {
        resolve();
      });
    });
  }
}
