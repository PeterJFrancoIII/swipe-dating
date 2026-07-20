variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "rds_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "rds_allocated_storage_gb" {
  type    = number
  default = 100
}

variable "elasticache_node_type" {
  type    = string
  default = "cache.r6g.large"
}

variable "evidence_bucket_name" {
  type = string
}

variable "ecs_desired_count" {
  type    = number
  default = 3
}
