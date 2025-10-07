variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "elastic_ip_allocation_id" {
  description = "Allocation ID of the Elastic IP to associate with the instance"
  type        = string
}

variable "allowed_inbound_cidr_blocks" {
  description = "CIDR blocks allowed to reach the app server"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "app_ami_id" {
  description = "AMI used for the application server"
  type        = string
  default     = "ami-0360c520857e3138f"
}

variable "app_instance_type" {
  description = "Instance type for the application server"
  type        = string
  default     = "t2.medium"
}

variable "app_root_volume_size" {
  description = "Root volume size in GiB for the application server"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "17.4"
}

variable "db_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for the RDS instance in GiB"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for the RDS instance in GiB"
  type        = number
  default     = 100
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "caritasdb"
}
