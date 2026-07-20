variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "instance_class" {
  type = string
}

variable "allocated_storage_gb" {
  type = number
}

# Placeholder — requires DB subnet group, security groups, secrets manager.
resource "aws_db_subnet_group" "this" {
  name       = "swipe-dating-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

output "endpoint" {
  value       = "swipe-dating-${var.environment}.placeholder.rds.local"
  description = "Replace with aws_db_instance endpoint when implemented"
}
