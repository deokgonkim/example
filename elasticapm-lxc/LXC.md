# LXC

Commands to create LXC Containers

## lxd init

Run first.

- `lxd init` using default configuration
```bash
Would you like to use LXD clustering? (yes/no) [default=no]: 
Do you want to configure a new storage pool? (yes/no) [default=yes]: 
Name of the new storage pool [default=default]: 
Name of the storage backend to use (cephobject, dir, lvm, zfs, btrfs, ceph) [default=zfs]: lvm
Create a new LVM pool? (yes/no) [default=yes]: 
Would you like to use an existing empty block device (e.g. a disk or partition)? (yes/no) [default=no]: yes
Path to the existing block device: /dev/nvme1n1
Would you like to connect to a MAAS server? (yes/no) [default=no]: 
Would you like to create a new local network bridge? (yes/no) [default=yes]: 
What should the new bridge be called? [default=lxdbr0]: 
What IPv4 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
What IPv6 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
Would you like the LXD server to be available over the network? (yes/no) [default=no]: 
Would you like stale cached images to be updated automatically? (yes/no) [default=yes]: 
Would you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: yes
```

## Create Containers

### elasticsearch

```bash
lxc launch ubuntu:20.04 elasticsearch
# set port forward
lxc config device add elasticsearch elasticsearch9200 proxy listen=tcp:0.0.0.0:9200 connect=tcp::9200
```

### kibana

```bash
lxc launch ubuntu:20.04 kibana
```

### Fleet server

```bash
lxc launch ubuntu:20.04 fleet_server
```