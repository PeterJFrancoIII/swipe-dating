variable "aws_region" {
  type        = string
  description = "AWS region for staging"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.20.0.0/16"
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "rds_allocated_storage_gb" {
  type    = number
  default = 20
}

variable "elasticache_node_type" {
  type    = string
  default = "cache.t4g.micro"
}

variable "evidence_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket for safety evidence vault"
  default     = "swipe-dating-staging-evidence-REPLACE"
}

variable "ecs_desired_count" {
  type    = number
  default = 1
}
