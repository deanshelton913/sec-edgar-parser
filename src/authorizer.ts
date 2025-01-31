import "./ServicesRegistry";
import { container } from "tsyringe";
import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import { AuthorizerService } from "./services/Authorizer";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  const authorizerService = container.resolve(AuthorizerService);
  return authorizerService.authorize(event);
};
