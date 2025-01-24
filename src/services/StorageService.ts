import { createReadStream, type ReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { S3, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { inject, injectable } from "tsyringe";
import { LoggingService } from "./LoggingService";

@injectable()
export class StorageService {
  public useS3 = true;
  public s3BucketName = "sec-edgar-production";
  public s3!: S3;
  public s3Region = "us-west-2";
  public localBaseDirectory = "/tmp";
  public s3BaseDirectory = "edgar-filings";

  constructor(
    @inject(LoggingService) protected loggingService: LoggingService,
  ) {
    this.s3 = new S3({ region: this.s3Region }); // Set your region
  }

  public getS3KeyFromSecUrl(url: string): string {
    return url
      .replace("https://www.sec.gov/Archives/edgar/data/", "")
      .replace(".txt", "");
  }

  public async writeFile(
    filePath: string,
    data: Buffer | string,
  ): Promise<void> {
    if (this.useS3) {
      const key = path.join(this.s3BaseDirectory, filePath);
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.s3BucketName,
        Key: key,
        Body: data,
        Expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      });
      await this.s3.send(putObjectCommand);
      this.loggingService.debug(`[STORAGE_SERVICE] WROTE_S3_FILE: ${key}`);
    } else {
      const fullPath = path.join(this.localBaseDirectory, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, data);
      this.loggingService.debug(
        `[STORAGE_SERVICE] WROTE_LOCAL_FILE: ${fullPath}`,
      );
    }
  }

  public async readFile(
    filePath: string,
  ): Promise<ReadableStream | ReadStream> {
    if (this.useS3) {
      const params = {
        Bucket: this.s3BucketName,
        Key: path.basename(filePath),
        responseType: "stream",
      };
      const data = await this.s3.send(new GetObjectCommand(params));
      if (!data.Body) {
        throw new Error("No body found in response");
      }
      return data.Body.transformToWebStream();
    }
    const stream = createReadStream(filePath);
    return stream;
  }
}
