variable "environment" {
  type = string
}

variable "bucket_name" {
  type = string
}

resource "aws_s3_bucket" "evidence" {
  bucket = var.bucket_name

  tags = {
    Name        = "swipe-dating-evidence-${var.environment}"
    Purpose     = "safety-evidence-vault"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_arn" {
  value = aws_s3_bucket.evidence.arn
}
