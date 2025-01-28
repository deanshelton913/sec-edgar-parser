resource "aws_api_gateway_rest_api" "edgar_api" {
  name = "edgar-api"
  description = "API for accessing Edgar records with API key authorization"
}

# Authorizer
resource "aws_api_gateway_authorizer" "authorizer" {
  name                       = "EdgarAuthorizer"
  rest_api_id                = aws_api_gateway_rest_api.edgar_api.id
  authorizer_uri             = "${module.authorizer.lambda_invoke_arn}"
  authorizer_result_ttl_in_seconds = 300
  type                       = "TOKEN"
  identity_source            = "method.request.header.Authorization"
}

# API Resource
resource "aws_api_gateway_resource" "edgar_records" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  parent_id   = aws_api_gateway_rest_api.edgar_api.root_resource_id
  path_part   = "records"
}

# API Method
resource "aws_api_gateway_method" "get_records" {
  rest_api_id   = aws_api_gateway_rest_api.edgar_api.id
  resource_id   = aws_api_gateway_resource.edgar_records.id
  http_method   = "GET"
  authorization = "CUSTOM"
  authorizer_id = aws_api_gateway_authorizer.authorizer.id
  request_parameters = {
    "method.request.querystring.fileName" = true
  }
}

# Integration with Lambda
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.edgar_api.id
  resource_id             = aws_api_gateway_resource.edgar_records.id
  http_method             = aws_api_gateway_method.get_records.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = module.getEdgarRecords.lambda_invoke_arn
}

# Deployment
resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.edgar_api.id
  stage_name  = "prod"
  depends_on  = [aws_api_gateway_integration.lambda_integration]
}

# Lambda Permission for API Gateway to Invoke
resource "aws_lambda_permission" "invoke_authorizer" {
  statement_id  = "AllowAPIGatewayInvokeAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = module.authorizer.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.edgar_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "invoke_get_records" {
  statement_id  = "AllowAPIGatewayInvokeGetRecords"
  action        = "lambda:InvokeFunction"
  function_name = module.getEdgarRecords.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.edgar_api.execution_arn}/*/*"
}
