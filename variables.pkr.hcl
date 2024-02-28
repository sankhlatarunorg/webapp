variable "project_id" {
  type    = string
  default = "csye-6225-tarun-002294529"
}

variable "credentials_file" {
  type    = string
  default = "credentials.json"
}

variable "zone" {
  type    = string
  default = "us-east1-b"
}

variable "image_name" {
  type    = string
  default = "csye6225-image-a3"
}

variable "source_image" {
  type    = string
  default = "centos-stream-8-v20240110"
}
