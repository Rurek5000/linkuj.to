terraform {
  required_providers {
    proxmox = {
      source = "bpg/proxmox"
      version = "~> 0.73"
    }
  }
}

provider "proxmox" {
  endpoint = var.proxmox_endpoint
  api_token = var.proxmox_api_token
  insecure = true
}

resource "proxmox_virtual_environment_file" "cloud_init" {
  content_type = "snippets"
  datastore_id = "local"
  node_name    = "lab"

  source_raw {
    data      = file("${path.module}/cloud-init.yaml")
    file_name = "k3s-cloud-init.yaml"
  }
}

resource "proxmox_virtual_environment_vm" "k3s_server" {
  name      = "k3s-server"
  node_name = "lab"
  vm_id     = 100

  clone {
    vm_id = 9000
  }

  cpu {
    cores = 2
  }

  memory {
    dedicated = 4096
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    size         = 20
  }

  network_device {
    bridge = "vmbr0"
    model  = "virtio"
  }

  initialization {
    ip_config {
      ipv4 {
        address = "192.168.0.100/24"
        gateway = "192.168.0.1"
      }
    }

    user_account {
      username = "ubuntu"
      keys     = [var.ssh_public_key]
    }

    user_data_file_id = proxmox_virtual_environment_file.cloud_init.id
  }
}
