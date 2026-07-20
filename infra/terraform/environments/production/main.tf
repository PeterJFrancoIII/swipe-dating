terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Production modules mirror staging shape with stricter defaults.
# apply blocked by policy — human operator only.

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "swipe-dating"
      Environment = "production"
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  environment = "production"
  cidr_block  = var.vpc_cidr
}

module "rds" {
  source = "../../modules/rds"

  environment          = "production"
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  instance_class       = var.rds_instance_class
  allocated_storage_gb = var.rds_allocated_storage_gb
}

module "elasticache" {
  source = "../../modules/elasticache"

  environment        = "production"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = var.elasticache_node_type
}

module "evidence_bucket" {
  source = "../../modules/s3-evidence"

  environment = "production"
  bucket_name = var.evidence_bucket_name
}

module "ecs" {
  source = "../../modules/ecs"

  environment        = "production"
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  service_name       = "rendezvous"
  desired_count      = var.ecs_desired_count
}
