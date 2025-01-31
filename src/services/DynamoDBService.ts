import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { inject, injectable } from "tsyringe";
import { LoggingService } from "./LoggingService";

interface FilingStatusRecord {
  filing_id: string;
  parsed_successfully: boolean;
}

interface ApiKeyRecord {
  api_key: string;
  policy: string;
}

@injectable()
export class DynamoDbService {
  private readonly filingTableName =
    "production-sec-edgar-parser-processed-filings";
  private readonly apiKeyTableName = "production-sec-edgar-parser-api-keys";
  private readonly db: DynamoDBDocument;

  constructor(
    @inject(LoggingService) protected loggingService: LoggingService,
  ) {
    const client = new DynamoDB({ region: "us-west-2" });
    this.db = DynamoDBDocument.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  // Filing Status Operations
  async setFilingStatus(
    filingId: string,
    parsedSuccessfully: boolean,
  ): Promise<void> {
    const item = {
      filing_id: filingId,
      parsed_successfully: parsedSuccessfully,
    };

    await this.db.put({
      TableName: this.filingTableName,
      Item: item,
    });
  }

  async getFilingStatus(filingId: string): Promise<FilingStatusRecord | null> {
    const result = await this.db.get({
      TableName: this.filingTableName,
      Key: {
        filing_id: filingId,
      },
    });

    if (result.Item) {
      return result.Item as FilingStatusRecord;
    }

    return null;
  }

  // API Key Operations
  async setApiKey(apiKey: string, policy: string): Promise<void> {
    const item = {
      api_key: apiKey,
      policy,
    };

    await this.db.put({
      TableName: this.apiKeyTableName,
      Item: item,
    });
  }

  async getApiKey(apiKey: string): Promise<ApiKeyRecord | null> {
    const result = await this.db.get({
      TableName: this.apiKeyTableName,
      Key: {
        api_key: apiKey,
      },
    });

    if (result.Item) {
      return result.Item as ApiKeyRecord;
    }

    return null;
  }

  async apiKeyExists(apiKey: string): Promise<boolean> {
    const result = await this.db.get({
      TableName: this.apiKeyTableName,
      Key: {
        api_key: apiKey,
      },
      ProjectionExpression: "api_key",
    });

    return !!result.Item;
  }
}
