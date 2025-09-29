output "instance_public_ip" {
  value     = aws_instance.app.public_ip
  sensitive = false
}

output "instance_private_ip" {
  value     = aws_instance.app.private_ip
  sensitive = false
}

output "db_username" {
  value     = var.db_username
  sensitive = false
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "db_endpoint" {
  value     = aws_db_instance.postgres.address
  sensitive = false
}

output "db_port" {
  value     = aws_db_instance.postgres.port
  sensitive = false
}

output "db_name" {
  value     = var.db_name
  sensitive = false
}

output "ssh_user" {
  value     = var.ssh_user
  sensitive = false
}

output "region" {
  value     = var.aws_region
  sensitive = false
}
