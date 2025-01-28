##########
# LAMBDA #
##########
module "getEdgarRecords" {
  source = "./_modules/lambda"

  prefix = "${local.prefix}-getEdgarRecords"

  image_uri = "${local.ecr_base_uri}/cron:${var.image_tag}"
  image_cmd = "edgarFilings.get"

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
