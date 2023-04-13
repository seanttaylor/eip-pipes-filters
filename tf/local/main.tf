# See https://tinyurl.com/yars5wa8 for tutorial on Terraform w/ localstack

terraform {
  backend "local" {}
}

provider "aws" {
  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  region                      = "us-east-1"
  s3_use_path_style           = true  # Required for LocalStack 
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    cloudwatch     = local.localstack_edge_port
    iam            = local.localstack_edge_port
    lambda         = local.localstack_edge_port
    logs           = local.localstack_edge_port
    s3             = local.localstack_edge_port
    secretsmanager = local.localstack_edge_port
    sqs            = local.localstack_edge_port
    ssm            = local.localstack_edge_port
    sts            = local.localstack_edge_port
  }
}


locals {
  app_owner = "com.omegalabs.platform"
  localstack_edge_port = "http://0.0.0.0:4566"
}


resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "${local.app_owner}.softserve"

  force_destroy = true
  tags = {
    "app_owner" = "${local.app_owner}"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

data "archive_file" "lambda_hello_world" {
  type = "zip"

  source_dir  = "../../src/lambda/hello-world"
  output_path = "../../dist/hello-world.zip"
}

resource "aws_s3_object" "lambda_hello_world" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "hello-world.zip"
  source = data.archive_file.lambda_hello_world.output_path

  etag = filemd5(data.archive_file.lambda_hello_world.output_path)
}

resource "aws_lambda_function" "hello_world" {
  function_name = "hello-world"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_hello_world.key

  runtime = "nodejs18.x"
  handler = "index.handler"

  source_code_hash = data.archive_file.lambda_hello_world.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "hello_world" {
  name = "/aws/lambda/${aws_lambda_function.hello_world.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "severless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_sqs_queue" "hello_world" {
  name = "hello_world"
}

resource "aws_iam_role_policy_attachment" "basic_exec_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_event_source_mapping" "example" {
  event_source_arn = aws_sqs_queue.hello_world.arn
  function_name    = aws_lambda_function.hello_world.arn
}

resource "aws_ssm_parameter" "hello_world_url" {
  name        = "/dev/platform/sqs/hello_world"
  description = "Connection URL for the hello_world SQS queue"
  type        = "String"
  value       = aws_sqs_queue.hello_world.id

  tags = {
    environment = "development"
  }
}

#resource "aws_iam_role_policy_attachment" "secrets_manager_rw_policy" {
#  role = aws_iam_role.lambda_exec.name
#  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
#}

#resource "aws_secretsmanager_secret" "lambda_event_source" {
#  name = "lambda-secret"
#}

#resource "aws_secretsmanager_secret_version" "kafka_auth" {
#  secret_id     = aws_secretsmanager_secret.lambda_event_source.id
#  secret_string = jsonencode({"username": "${var.MY_KAFKA_CLUSTER_API_KEY}", "password": "${var.MY_KAFKA_CLUSTER_SECRET}"})
#}

#resource "aws_lambda_event_source_mapping" "example" {
#  function_name     = aws_lambda_function.hello_world.arn
#  topics            = ["hello_world"]
#  starting_position = "TRIM_HORIZON"
#
#  self_managed_event_source {
#    endpoints = {
#      KAFKA_BOOTSTRAP_SERVERS = "${var.MY_KAFKA_BOOTSTRAP_SERVERS}"
#    }
#  }

#  source_access_configuration {
#    # See https://github.com/localstack/localstack/issues/6121#issuecomment-1134250573
#    type = "BASIC_AUTH"
#    uri = aws_secretsmanager_secret.lambda_event_source.arn
#  }

#  depends_on = [
#    aws_secretsmanager_secret.lambda_event_source
#  ]
#}