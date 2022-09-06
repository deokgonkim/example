# LVM

**Deprecated** LVM is directly managed by LXC. see [LXC.md](LXC)

~~To dynamically resize volume, uses LVM~~

## Create PV

```bash
pvcreate /dev/nvme1n1
```

## Create VG

```bash
vgcreate vg_data /dev/nvme1n1
```

## Create LV

```bash
lvcreate -s +100%FREE /dev/vg_data/lvol0
```

