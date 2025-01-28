import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "tsyringe";
import { LoggingService } from "./LoggingService";

interface FilingStatusRecord {
  filing_id: string;
  parsed_successfully: boolean;
}
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
   * @param parsedSuccessfully - Indicates whether the filing was parsed successfully.
   * @param additionalData - Any additional data to store with the record.
   */
  async setItem(filingId: string, parsedSuccessfully: boolean): Promise<void> {
    const item = {
      filing_id: filingId,
      parsed_successfully: parsedSuccessfully,
    };

    await this.db.put({
      TableName: this.tableName,
      Item: item,
    });
  }

  /**
   * Retrieve an item by its hash key (filing_id).
   * @param filingId - The unique ID of the filing.
   * @returns The item, or null if not found.
   */
  async getItem(filingId: string): Promise<FilingStatusRecord | null> {
    const result = await this.db.get({
      TableName: this.tableName,
      Key: {
        filing_id: filingId,
      },
    });

    if (result.Item) {
      return result.Item as FilingStatusRecord;
    }

    return null;
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

    return !!result.Item;
  }
}
