variable "project" {
  type    = string
  default = "caritas"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t2.medium"
}

variable "instance_volume_size" {
  type    = number
  default = 40
}

variable "elastic_ip_allocation_id" {
  type = string
}

variable "ssh_key_name" {
  type    = string
  default = "caritas-deploy"
}

variable "ssh_public_key" {
  type = string
}

variable "ssh_user" {
  type    = string
  default = "ubuntu"
}

variable "allowed_ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "db_username" {
  type    = string
  default = "caritas_app"
}

variable "db_name" {
  type    = string
  default = "caritas"
}

variable "db_allocated_storage" {
  type    = number
  default = 20
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "db_engine_version" {
  type    = string
  default = "15"
}
