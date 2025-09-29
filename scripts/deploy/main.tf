terraform {
	required_version = ">= 1.6.0"

	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = "~> 5.62"
		}

		random = {
			source  = "hashicorp/random"
			version = "~> 3.6"
		}
	}
}

provider "aws" {
	region = var.aws_region
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_vpc" "default" {
	default = true
}

data "aws_subnets" "default" {
	filter {
		name   = "vpc-id"
		values = [data.aws_vpc.default.id]
	}
}

data "aws_ami" "ubuntu" {
	most_recent = true
	owners      = ["099720109477"]

	filter {
		name   = "name"
		values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
	}

	filter {
		name   = "virtualization-type"
		values = ["hvm"]
	}
}

resource "random_password" "db_password" {
	length           = 24
	special          = true
	override_special = "-_+="
}

resource "aws_key_pair" "deployment" {
	key_name   = var.ssh_key_name
	public_key = var.ssh_public_key
}

resource "aws_security_group" "app" {
	name        = "${var.project}-app-sg"
	description = "Security group for ${var.project} application"
	vpc_id      = data.aws_vpc.default.id

	ingress {
		description = "SSH"
		from_port   = 22
		to_port     = 22
		protocol    = "tcp"
		cidr_blocks = [var.allowed_ssh_cidr]
	}

	ingress {
		description = "HTTP"
		from_port   = 80
		to_port     = 80
		protocol    = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
		ipv6_cidr_blocks = ["::/0"]
	}

	ingress {
		description = "HTTPS"
		from_port   = 443
		to_port     = 443
		protocol    = "tcp"
		cidr_blocks = ["0.0.0.0/0"]
		ipv6_cidr_blocks = ["::/0"]
	}

	egress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
		ipv6_cidr_blocks = ["::/0"]
	}
}

resource "aws_security_group" "database" {
	name        = "${var.project}-db-sg"
	description = "Security group for ${var.project} database"
	vpc_id      = data.aws_vpc.default.id

	ingress {
		description = "Postgres from app"
		from_port   = 5432
		to_port     = 5432
		protocol    = "tcp"
		security_groups = [aws_security_group.app.id]
	}

	egress {
		from_port   = 0
		to_port     = 0
		protocol    = "-1"
		cidr_blocks = ["0.0.0.0/0"]
		ipv6_cidr_blocks = ["::/0"]
	}
}

resource "aws_db_subnet_group" "database" {
	name       = "${var.project}-db-subnets"
	subnet_ids = data.aws_subnets.default.ids
}

resource "aws_instance" "app" {
	ami                         = data.aws_ami.ubuntu.id
	instance_type               = var.instance_type
	subnet_id                   = data.aws_subnets.default.ids[0]
	vpc_security_group_ids      = [aws_security_group.app.id]
	key_name                    = aws_key_pair.deployment.key_name
	associate_public_ip_address = true

	root_block_device {
		volume_size = var.instance_volume_size
		volume_type = "gp3"
		encrypted   = true
	}

	tags = {
		Name        = "${var.project}-app"
		Project     = var.project
		Environment = var.environment
	}
}

resource "aws_eip_association" "app" {
	allocation_id = var.elastic_ip_allocation_id
	instance_id   = aws_instance.app.id
}

resource "aws_db_instance" "postgres" {
	identifier              = "${var.project}-db"
	engine                  = "postgres"
	engine_version          = var.db_engine_version
	instance_class          = var.db_instance_class
	allocated_storage       = var.db_allocated_storage
	storage_type            = "gp3"
	db_subnet_group_name    = aws_db_subnet_group.database.name
	vpc_security_group_ids  = [aws_security_group.database.id]
	username                = var.db_username
	password                = random_password.db_password.result
	db_name                 = var.db_name
	publicly_accessible     = false
	skip_final_snapshot     = true
	deletion_protection     = false
	backup_retention_period = 1
	auto_minor_version_upgrade = true
	apply_immediately          = true

	tags = {
		Name        = "${var.project}-db"
		Project     = var.project
		Environment = var.environment
	}
}
