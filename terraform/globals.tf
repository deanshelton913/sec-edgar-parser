locals {
  aws_region     = "us-west-2"
  aws_account_id = "432916826401"

  env    = var.environment
  prefix = "${local.env}-sec-edgar-parser"

  ecr_base_uri = "432916826401.dkr.ecr.us-west-2.amazonaws.com/sec-edgar-parser"

  default_tags = {
    ManagedByTerraform = "true"
    Environment        = local.env
    App                = "sec-edgar-parser"
  }

}




