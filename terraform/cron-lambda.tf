##########
# LAMBDA #
##########
module "cron" {
  source = "./_modules/lambda"

  prefix = "${local.prefix}-cron"

  image_uri = "${local.ecr_base_uri}/cron:${var.image_tag}"
  image_cmd = "index.handler"

  env_vars = {
    APP_ENV = local.env
  }

  iam_permissions = [
    {
      Action = [
        "cloudwatch:PutMetricData",
      ]
      Effect   = "Allow"
      Resource = "*" # TODO: scope to correct resource
    },
    {
      Action = [
        "s3:*",
      ]
      Effect   = "Allow"
      Resource = "*"
    },
  ]
}

############
# TRIGGERS #
############
resource "aws_cloudwatch_event_rule" "cron" {
  name                = "${local.prefix}-cron-cron"
  description         = "scheduled every 1 min"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "cron" {
  arn  = module.cron.lambda_arn
  rule = aws_cloudwatch_event_rule.cron.name
}

resource "aws_lambda_permission" "cron" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.cron.lambda_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron.arn
}
