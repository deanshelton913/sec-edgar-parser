resource "aws_lambda_function" "this" {
  function_name = lower(var.prefix)

  package_type = "Image"
  image_uri    = var.image_uri
  image_config {
    command = [var.image_cmd]
  }

  layers                         = var.layers
  timeout                        = var.timeout
  reserved_concurrent_executions = var.max_concurrency
  memory_size                    = var.memory_size

  role = aws_iam_role.this.arn

  environment {
    variables = var.env_vars
  }
}
