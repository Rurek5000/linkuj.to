variable "proxmox_endpoint" {
  description = "https://192.168.1.10:8006"
  type        = string
}

variable "proxmox_api_token" {
  description = "user@realm!tokenid=secret"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "Public SSH key"
  type = string
}