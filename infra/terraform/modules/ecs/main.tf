variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "service_name" {
  type = string
}

variable "desired_count" {
  type = number
}

resource "aws_ecs_cluster" "this" {
  name = "swipe-dating-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Fargate service placeholder — wire task definition + ALB in follow-up slice.
output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "service_placeholder" {
  value       = "${var.service_name}:${var.desired_count}"
  description = "ECS service wiring pending — rendezvous image + task def"
}
