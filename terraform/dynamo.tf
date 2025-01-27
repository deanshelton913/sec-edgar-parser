resource "aws_dynamodb_table" "processed_filings" {
  name           = "${local.prefix}-processed-filings" # DynamoDB table name
  billing_mode   = "PAY_PER_REQUEST"   # On-demand pricing

  # Define the primary key schema
  hash_key       = "filing_id"         # Partition key (no range key)

  # Define attribute definitions
  attribute {
    name = "filing_id"
    type = "S" # String type
  }

  # Enable server-side encryption (optional)
  server_side_encryption {
    enabled = true
  }

  # Add tags for resource tracking (optional)
  tags = {
    Environment = "Production"
    Project     = "FilingProcessor"
  }
}
