import machine
import neopixel


BUTTON_PIN = 2 # GPIO2 wemos d1 mini `D4`

LED_COUNT = 1
LED_PIN = 4 # GPIO4 wemos d1 mini `D2`


class Button():

    def __init__(self, np):
        self.np = np
        self.color = (255, 0, 0)

        self.button = machine.Pin(BUTTON_PIN, machine.Pin.IN)
        self.button.irq(trigger=machine.Pin.IRQ_RISING, handler=self.button_handler)


    def button_handler(self, pin):
        print('Button touched')
        self.np[0] = self.color
        self.np.write()
        self.color = self.color[1:] + self.color[:1]

np = neopixel.NeoPixel(machine.Pin(LED_PIN), LED_COUNT)

button = Button(np)

