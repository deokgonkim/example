# esphome

```bash
# create base config
esphome wizard livingroom.yaml
# add dht11 config
vi livingroom.yaml
# `flashing`
esphome run livingroom.yaml
```

# unexpected tries

```bash
# brltty is blocking esp8266???
# /dev/ttyUSB0 is not being created
# https://stackoverflow.com/questions/70123431/why-would-ch341-uart-is-disconnected-from-ttyusb
sudo apt remove brltty
# add `dgkim` user to `dialout` group
# to read/write /dev/ttyUSB0
sudo usermod -a -G dialout dgkim
```
