variable "environment" {
  type        = string
  default     = "production"
  description = "The environment to deploy to ('staging' or 'production')."

  validation {
    condition     = var.environment == "staging" || var.environment == "production"
    error_message = "The environment must be 'staging' or 'production'."
  }
}

variable "image_tag" {
  type        = string
  description = "Tag to use when pulling lambda images."
  default     = "latest"
}

