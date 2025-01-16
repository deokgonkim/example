from machine import Pin
import neopixel
import time


def spin_color(c):
    return (c[2], c[0], c[1])


def main():
    enable_pin = Pin(19, Pin.OUT)
    led_pin = Pin(20, Pin.OUT)
    n = neopixel.NeoPixel(led_pin, 1)
    btn = Pin(9, Pin.IN)
    enable_pin.on()
    initial_led = (0, 0, 255)
    n[0] = initial_led
    while True:
        pressed = btn.value()
        if pressed == 0:
            n[0] = spin_color(n[0])
            n.write()
        time.sleep_ms(100)


