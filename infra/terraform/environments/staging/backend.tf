# Staging Terraform backend — configure before apply.
# Example (human-owned): S3 backend + DynamoDB lock table.

# terraform {
#   backend "s3" {
#     bucket         = "swipe-dating-tfstate-staging"
#     key            = "staging/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "swipe-dating-tflock"
#     encrypt        = true
#   }
# }
