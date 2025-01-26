locals {
  ecr_names = toset(["sec-edgar-parser/cron"])
}

# ECRs are created manually since they need to exist for the build job in ci (runs before infra is deployed)
# but we still want to make sure that they are configured correctly.
# Manually created ECRs should have `Scan on push` on!
data "aws_ecr_repository" "ecr" {
  for_each = local.ecr_names

  name = each.key
}

data "aws_iam_policy_document" "ecr" {
  statement {
    sid    = "LambdaECRImageRetrievalPolicy"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
  }
}

resource "aws_ecr_repository_policy" "ecr" {
  for_each = local.ecr_names

  repository = data.aws_ecr_repository.ecr[each.key].name
  policy     = data.aws_iam_policy_document.ecr.json
}

resource "aws_ecr_lifecycle_policy" "ecr" {
  for_each = local.ecr_names

  repository = data.aws_ecr_repository.ecr[each.key].name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Expire images older than 14 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 14
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
}
