resource "aws_iam_role" "this" {
  name = "${var.prefix}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "this" {
  name = "${var.prefix}-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat([
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Effect = "Allow"
        Resource = [
          aws_cloudwatch_log_group.this.arn,
          "${aws_cloudwatch_log_group.this.arn}:*"
        ]
      }
    ], var.iam_permissions)
  })
}

resource "aws_iam_role_policy_attachment" "this" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.this.arn
}

