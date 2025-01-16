# This file is executed on every boot (including wake-boot from deepsleep)
#import esp
#esp.osdebug(None)
import time
from network import WLAN
sta_if = WLAN(WLAN.IF_STA)
sta_if.active(True)
sta_if.connect("${SSID}", "${PASSWORD}")
time.sleep(3)
print(sta_if.ipconfig('addr4'))
import webrepl
webrepl.start()
import m5nanoc6
print('m5nanoc6 loaded')

