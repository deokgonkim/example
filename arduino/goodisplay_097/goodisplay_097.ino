#include <SPI.h>
#include "Display_EPD_W21_spi.h"
#include "Display_EPD_W21.h"
#include "Ap_29demo.h"

/*
The code is from A8266-GDEM0097Z61 example from goodisplay
*/

#define BTN_TRIGGER D3

void setup() {
  // put your setup code here, to run once:

  pinMode(BTN_TRIGGER, INPUT_PULLUP); // triggering call epd display

  pinMode(D0, INPUT);   // BUSY
  pinMode(D1, OUTPUT);  // RES
  pinMode(D2, OUTPUT);  // DC
  pinMode(D4, OUTPUT);  // CS

  SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
  SPI.begin();
  Serial.begin(115200);
}

void loop() {
  // put your main code here, to run repeatedly:
  unsigned char i;
  Serial.println("Loop");
  if (digitalRead(BTN_TRIGGER) == LOW) {
    Serial.println("Button is pressed");
    fullScreenRefresh();
  }
  delay(1000);
}

void fullScreenRefresh() {
  Serial.println("Before fullScreenRefresh");
  // EPD_HW_Init(); //Electronic paper initialization.			
  // Serial.println("EPD_HW_Init");
  // EPD_WhiteScreen_ALL(gImage_BW1,gImage_RW1); //To Display one image using full screen refresh.
  // Serial.println("EPD_WhiteScreen_ALL");
  // EPD_DeepSleep(); //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  // Serial.println("EPD_DeepSleep");
  // Serial.println("Done");
}
