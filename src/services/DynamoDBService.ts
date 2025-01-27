import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "tsyringe";
import { LoggingService } from "./LoggingService";

@injectable()
export class DynamoDbService {
  private readonly tableName = "production-sec-edgar-parser-processed-filings"; // Name of the DynamoDB table
  private readonly db: DynamoDBDocument;

  constructor(
    @inject(LoggingService) protected loggingService: LoggingService,
  ) {
    const client = new DynamoDB({ region: "us-west-2" });
    this.db = DynamoDBDocument.from(client, {
      marshallOptions: {
        removeUndefinedValues: true, // Automatically remove undefined values from items
      },
    });
  }

  /**
   * Add (set) an item to the DynamoDB table.
   * If the item already exists, it will be overwritten.
   * @param filingId - The unique ID of the filing.
   * @param additionalData - Any additional data to store with the record.
   */
  async setItem(
    filingId: string,
    additionalData: Record<string, unknown> = {},
  ): Promise<void> {
    const item = {
      filing_id: filingId,
      ...additionalData,
    };

    await this.db.put({
      TableName: this.tableName,
      Item: item,
    });

    this.loggingService.debug(
      `[DYNAMO_DB_SERVICE] Set item in ${this.tableName}:`,
      JSON.stringify(item),
    );
  }

  /**
   * Check if an item exists in the DynamoDB table by its hash key (filing_id).
   * @param filingId - The unique ID of the filing.
   * @returns A boolean indicating whether the item exists.
   */
  async exists(filingId: string): Promise<boolean> {
    const result = await this.db.get({
      TableName: this.tableName,
      Key: {
        filing_id: filingId,
      },
      ProjectionExpression: "filing_id", // Minimize data returned to only the key
    });

    if (result.Item) {
      return true;
    }

    return false;
  }
}
