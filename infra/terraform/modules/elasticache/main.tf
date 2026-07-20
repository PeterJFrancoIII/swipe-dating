variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "node_type" {
  type = string
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "swipe-dating-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

output "endpoint" {
  value       = "swipe-dating-${var.environment}.placeholder.cache.local"
  description = "Replace with aws_elasticache_cluster endpoint when implemented"
}
