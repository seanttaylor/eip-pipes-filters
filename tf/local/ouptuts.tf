output "lambda_function_names" {
  description = "Name(s) of the lamba function(s)"
  value = {
    hello_world = aws_lambda_function.hello_world.function_name
  }
}
output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value = aws_s3_bucket.lambda_bucket.id
}

output "sqs_queue_url" {
  description = "URL of the SQS queue"
  value = aws_sqs_queue.hello_world.id
}