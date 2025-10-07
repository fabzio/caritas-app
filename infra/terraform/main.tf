terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.73"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  valkey_subnet_ids = length(data.aws_subnets.default.ids) > 3 ? slice(data.aws_subnets.default.ids, 0, 3) : data.aws_subnets.default.ids
}

resource "tls_private_key" "caritas" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "caritas" {
  key_name   = "caritas-app-key"
  public_key = tls_private_key.caritas.public_key_openssh
}

resource "aws_security_group" "app" {
  name        = "caritas-app-sg"
  description = "Security group for the application server"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_inbound_cidr_blocks
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_inbound_cidr_blocks
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_inbound_cidr_blocks
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.allowed_inbound_cidr_blocks
  }

  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = var.allowed_inbound_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "caritas-app-sg"
  }
}

resource "aws_instance" "app" {
  ami                         = var.app_ami_id
  instance_type               = var.app_instance_type
  key_name                    = aws_key_pair.caritas.key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.app.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = var.app_root_volume_size
    volume_type = "gp3"
  }

  tags = {
    Name = "main-caritas-server"
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = var.elastic_ip_allocation_id
}

resource "aws_security_group" "db" {
  name        = "caritas-db-sg"
  description = "Security group for the PostgreSQL instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "caritas-db-sg"
  }
}

resource "aws_db_subnet_group" "postgres" {
  name       = "caritas-postgres-subnets"
  subnet_ids = data.aws_subnets.default.ids
}

resource "random_password" "db" {
  length           = 20
  special          = true
  override_special = "!#$%&*"
}

resource "random_password" "valkey_user" {
  length           = 32
  special          = true
  override_special = "!#$%&*"
}

resource "aws_db_instance" "postgres" {
  identifier              = "caritas-postgres"
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  username                = var.db_username
  password                = random_password.db.result
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.db.id]
  publicly_accessible     = false
  skip_final_snapshot     = true
  deletion_protection     = false
  apply_immediately       = true
  backup_retention_period = 1
  auto_minor_version_upgrade = true
}

resource "aws_security_group" "valkey" {
  name        = "caritas-valkey-sg"
  description = "Security group for the Valkey cache"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "caritas-valkey-sg"
  }
}

resource "aws_elasticache_subnet_group" "valkey" {
  name       = "caritas-valkey-subnets"
  subnet_ids = local.valkey_subnet_ids
}

resource "aws_elasticache_user" "caritas" {
  user_id              = "caritas-valkey"
  user_name            = "caritas-valkey"
  engine               = "valkey"
  access_string        = "on ~* +@all"
  passwords            = [random_password.valkey_user.result]
  no_password_required = false
}

resource "aws_elasticache_user_group" "caritas" {
  engine        = "valkey"
  user_group_id = "caritas-valkey-group"
  user_ids      = [aws_elasticache_user.caritas.user_id]

  tags = {
    Name = "caritas-valkey-user-group"
  }
}

resource "aws_elasticache_serverless_cache" "valkey" {
  name               = "caritas-valkey"
  description        = "Valkey serverless cache for Caritas app"
  engine             = "valkey"
  subnet_ids         = local.valkey_subnet_ids
  security_group_ids = [aws_security_group.valkey.id]
  user_group_id      = aws_elasticache_user_group.caritas.user_group_id

  depends_on = [aws_elasticache_user_group.caritas]

  lifecycle {
    precondition {
      condition     = length(local.valkey_subnet_ids) >= 2
      error_message = "Valkey serverless cache requires at least two subnets"
    }
  }
}