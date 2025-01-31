resource "aws_api_gateway_rest_api" "edgar_api" {
  name        = "edgar-api"
  description = "API for accessing Edgar records with API key authorization"
  
  # ✅ Allow all binary types except application/json
  binary_media_types = ["*/*"]
}

# 🔐 Authorizer
resource "aws_api_gateway_authorizer" "authorizer" {
  name                             = "EdgarAuthorizer"
  rest_api_id                      = aws_api_gateway_rest_api.edgar_api.id
  authorizer_uri                   = module.authorizer.lambda_invoke_arn
  authorizer_result_ttl_in_seconds = 300
  type                             = "TOKEN"
  identity_source                  = "method.request.header.Authorization"
}

# 📂 Define API Resources and Methods
resource "aws_api_gateway_resource" "edgar_data" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_rest_api.edgar_api.root_resource_id
  path_part   = "edgar-data"
}

resource "aws_api_gateway_resource" "part1" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_resource.edgar_data.id
  path_part   = "{part1}"
}

resource "aws_api_gateway_resource" "part2" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_resource.part1.id
  path_part   = "{part2}"
}

resource "aws_api_gateway_resource" "part3" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_resource.part2.id
  path_part   = "{part3}"
}

resource "aws_api_gateway_resource" "part4" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_resource.part3.id
  path_part   = "{part4}"
}

# ✅ Define API Method for part3
resource "aws_api_gateway_method" "get_records_part3" {
  rest_api_id   = aws_api_gateway_rest_api.edgar_api.id
  resource_id   = aws_api_gateway_resource.part3.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.authorizer.id
}

# ✅ Define API Method for part4
resource "aws_api_gateway_method" "get_records_part4" {
  rest_api_id   = aws_api_gateway_rest_api.edgar_api.id
  resource_id   = aws_api_gateway_resource.part4.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.authorizer.id
}

# 🔄 Integration with Lambda for part3 (Handles Binary Responses)
resource "aws_api_gateway_integration" "lambda_integration_part3" {
  rest_api_id             = aws_api_gateway_rest_api.edgar_api.id
  resource_id             = aws_api_gateway_resource.part3.id
  http_method             = aws_api_gateway_method.get_records_part3.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = module.getEdgarRecords.lambda_invoke_arn
  content_handling        = "CONVERT_TO_BINARY" # ✅ Convert binary responses
}

# 🔄 Integration with Lambda for part4 (Handles Binary Responses)
resource "aws_api_gateway_integration" "lambda_integration_part4" {
  rest_api_id             = aws_api_gateway_rest_api.edgar_api.id
  resource_id             = aws_api_gateway_resource.part4.id
  http_method             = aws_api_gateway_method.get_records_part4.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = module.getEdgarRecords.lambda_invoke_arn
  content_handling        = "CONVERT_TO_BINARY" # ✅ Convert binary responses
}

# 🚀 Force API Gateway Deployment to Always Update
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  stage_name  = "prod"

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.edgar_api))
  }

  depends_on = [
    aws_api_gateway_integration.lambda_integration_part3,
    aws_api_gateway_integration.lambda_integration_part4
  ]
}

# ✅ Lambda Permission for API Gateway to Invoke Lambda Functions
resource "aws_lambda_permission" "invoke_get_records" {
  statement_id  = "AllowAPIGatewayInvokeGetRecords"
  action        = "lambda:InvokeFunction"
  function_name = module.getEdgarRecords.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.edgar_api.execution_arn}/*"
}

resource "aws_lambda_permission" "invoke_authorizer" {
  statement_id  = "AllowAPIGatewayInvokeEdgarAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = module.authorizer.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.edgar_api.execution_arn}/*"
}
