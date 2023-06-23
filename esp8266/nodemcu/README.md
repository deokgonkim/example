# Running nodemcu on ESP8266

- Reference : https://nodemcu.readthedocs.io/en/release/getting-started/

## Install esptool

```
pip install esptool
```

## Build using cloud build

- https://nodemcu-build.com/

## Upload firmware

```
esptool.py --port /dev/ttyUSB0 write_flash -fm dio 0x00000 ~/Downloads/nodemcu-release-11-modules-2023-06-23-01-13-59-float.bin
```

