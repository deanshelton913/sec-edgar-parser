output "lambda_arn" {
  value       = aws_lambda_function.this.arn
  description = "ARN of the lambda created by the module."
}

output "lambda_function_name" {
  value       = aws_lambda_function.this.function_name
  description = "ARN of the lambda created by the module."
}

output "lambda_invoke_arn" {
  value       = aws_lambda_function.this.invoke_arn
  description = "ARN of the lambda created by the module."
}
