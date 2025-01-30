terraform {
  backend "local" {
    path = "./terraform.tfstate" # Path to store the state file
  }

  required_version = "~> 1.1"
  required_providers {
    # archive = {
    #   source  = "hashicorp/archive"
    #   version = "~> 2.3"
    # }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.54"
    }
  }
}
