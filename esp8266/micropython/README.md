# Running micropython on esp8266

## Install micropython on esp8266

- reference : https://docs.micropython.org/en/latest/esp8266/tutorial/intro.html

- Install esptool
  ```
  pip install esptool
  ```

- Erase previously installed firmware
  ```
  esptool.py --port /dev/ttyUSB0 erase_flash
  ```

- Install micropython on esp8266
  ```
  esptool.py --port /dev/ttyUSB0 --baud 460800 write_flash --flash_size=detect 0 esp8266-ota-20230426-v1.20.0.bin
  ```

