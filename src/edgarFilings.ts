import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3();

export const get = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log({ event });
  const { part1, part2, part3, part4 } = event.pathParameters || {};
  const filingId = [part1, part2, part3, part4].filter(Boolean).join("/");

  if (!filingId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required path parameters." }),
    };
  }

  try {
    const bucketName = "sec-edgar-production";
    const objectKey = `edgar-filings/${filingId}`;

    const file = await s3
      .getObject({ Bucket: bucketName, Key: objectKey })
      .promise();

    if (!file.Body) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "File is empty or missing." }),
      };
    }

    const contentType = file.ContentType;

    const isJson = contentType?.startsWith("application/json");
    return {
      statusCode: 200,
      headers: { "Content-Type": contentType || "application/text" },
      body: isJson ? file.Body.toString("utf-8") : file.Body.toString("base64"), // ✅ Avoid Base64 for JSON
      isBase64Encoded: !isJson, // ✅ Only Base64-encode non-JSON content
    };
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    const e = error as { code?: string };

    if (e.code === "NoSuchKey") {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `File '${filingId}' not found.` }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An error occurred." }),
    };
  }
};
