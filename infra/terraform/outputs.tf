output "caritas_key_pair_name" {
  value = aws_key_pair.caritas.key_name
}

output "caritas_private_key_pem" {
  value     = tls_private_key.caritas.private_key_pem
  sensitive = true
}

output "instance_id" {
  value = aws_instance.app.id
}

output "instance_public_ip" {
  value = aws_instance.app.public_ip
}

output "instance_public_dns" {
  value = aws_instance.app.public_dns
}

output "db_identifier" {
  value = aws_db_instance.postgres.identifier
}

output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_port" {
  value = aws_db_instance.postgres.port
}

output "db_username" {
  value = aws_db_instance.postgres.username
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true
}

output "valkey_endpoint" {
  value = aws_elasticache_serverless_cache.valkey.endpoint
}

output "valkey_password" {
  value     = random_password.valkey_user.result
  sensitive = true
}

output "valkey_user" {
  value = aws_elasticache_user.caritas.user_name
}

output "valkey_port" {
  value = 6379
}

output "valkey_identifier" {
  value = aws_elasticache_serverless_cache.valkey.name
}
