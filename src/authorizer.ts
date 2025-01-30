import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  console.log({event})
  try {
    // Validate the token (replace with your logic, e.g., check API key)
    const token = event.authorizationToken;
    const validApiKeys = ["123456", "abcdef"]; // Example API keys

    if (!token || !validApiKeys.includes(token)) {
      throw new Error("Unauthorized");
    }

    return {
      principalId: "user", // The principal identifier
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: `arn:aws:execute-api:us-west-2:432916826401:2a08lh8po2/prod/*`, // The ARN of the method being accessed
          },
        ],
      },
      context: {
        key: "example-context-value", // Optional: Add custom context
      },
    };
  } catch (error) {
    console.error("Authorization failed", error);
    throw new Error("Unauthorized"); // Triggers a 401 response
  }
};
