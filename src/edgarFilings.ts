import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

// Initialize the S3 client
const s3 = new AWS.S3();

export const get = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // Extract 'filingId' from query parameters
  const filingId = `${event.pathParameters?.part1}/${event.pathParameters?.part2}/${event.pathParameters?.part3}`;
  try {
    

    if (!filingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required query parameter 'filingId'.",
        }),
      };
    }

    // Define the S3 bucket and key
    const bucketName = "sec-edgar-production";
    const objectKey = `edgar-filings/${filingId}`;

    // Get the file from S3
    const file = await s3
      .getObject({
        Bucket: bucketName,
        Key: objectKey,
      })
      .promise();

    // Return the file content
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json", // Ensure correct MIME type
      },
      body: file.Body?.toString("utf-8") || "", // Convert file buffer to string
    };
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    const e = error as { code: string };
    // Return an error response if the file is not found or there's an issue
    if (e.code === "NoSuchKey") {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `File with filingId '${filingId}' not found.`,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while processing your request.",
      }),
    };
  }
};
