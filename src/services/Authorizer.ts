import { inject, injectable } from "tsyringe";
import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { DynamoDbService } from "./DynamoDBService";

@injectable()
export class AuthorizerService {
  constructor(
    @inject(DynamoDbService) private dynamoDbService: DynamoDbService,
  ) {}

  public async authorize(
    event: APIGatewayTokenAuthorizerEvent,
  ): Promise<APIGatewayAuthorizerResult> {
    try {
      console.log({ event });
      const token = event.authorizationToken;

      if (!token) {
        throw new Error("No authorization token provided");
      }

      const apiKeyRecord = await this.dynamoDbService.getApiKey(token);
      console.log({ apiKeyRecord });
      if (!apiKeyRecord) {
        throw new Error("Invalid API key");
      }

      // Parse the policy string into an array of resource ARNs
      const policyDocument = JSON.parse(apiKeyRecord.policy);

      return {
        principalId: token,
        policyDocument,
        context: {
          apiKey: token,
        },
      };
    } catch (error) {
      throw new Error("Unauthorized");
    }
  }
}
