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
sudo apt remove brltty
# add `dgkim` user to `dialout` group
# to read/write /dev/ttyUSB0
sudo usermod -a -G dialout dgkim
```
