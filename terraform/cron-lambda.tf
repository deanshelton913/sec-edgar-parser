##########
# LAMBDA #
##########
# Estimated monthly cost for Each Memory Size based on 1 day of data
# at current schedule (every 1m mon-fri during business hours EST)
# 128MB	$0.35
# 256MB	$0.71
# 512MB	$1.41
# 1024MB	$2.83
# 2048MB	$5.65
# 3072MB	$8.48
# 4096MB	$11.30
# 5120MB	$14.13
# 6144MB	$16.95
# 7168MB	$19.78
# 8192MB	$22.60
# 9216MB	$25.43
# 10240MB	$28.25
module "cron" {
  source      = "./_modules/lambda"
  prefix      = "${local.prefix}-cron"
  memory_size = 2048
  image_uri   = "${local.ecr_base_uri}/cron:${var.image_tag}"
  image_cmd   = "index.handler"

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
        "dynamodb:*", # TODO: scope to correct resource
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
  name        = "${local.prefix}-cron-cron"
  description = "Runs every minute from 2AM to 6PM EST (UTC 07-22), Monday-Friday, ignoring DST."
  # CloudWatch cron format: cron(Minute Hour Day-of-month Month Day-of-week Year)
  # * 7-22     => every minute during hours 07-22 UTC i.e.: 02-17:59 EST
  # ?         => no specific day-of-month
  # *         => every month
  # MON-FRI   => Monday through Friday
  # *         => every year
  schedule_expression = "cron(* 7-22 ? * MON-FRI *)"
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
