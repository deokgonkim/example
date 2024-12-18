#include <SPI.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include "Display_EPD_W21_spi.h"
#include "Display_EPD_W21.h"
#include "Ap_29demo.h"

#include "arduino_secrets.h"

/*
The code is from A8266-GDEM0097Z61 example from goodisplay
*/

#define BTN_TRIGGER D3

#define FUNCTION_COUNT 5


const char* ssid = SECRET_SSID;
const char* password = SECRET_PASSWORD;

const char* timeServer = "pool.ntp.org";
const long utcOffsetInSeconds = 3600*9;

WiFiUDP udp;
NTPClient timeClient(udp, timeServer, utcOffsetInSeconds);


void (*functions[FUNCTION_COUNT])();
int i = 0;
String currentTime;

void setup() {
  // put your setup code here, to run once:

  pinMode(BTN_TRIGGER, INPUT_PULLUP); // triggering call epd display

  pinMode(D0, INPUT);   // BUSY
  pinMode(D1, OUTPUT);  // RES
  pinMode(D2, OUTPUT);  // DC
  pinMode(D4, OUTPUT);  // CS

  functions[0] = fullScreenRefresh;
  functions[1] = partialRefresh;
  functions[2] = partialRefresh2;
  functions[3] = rotated;
  functions[4] = clear;
  // functions[5] = displayClock;

  SPI.beginTransaction(SPISettings(10000000, MSBFIRST, SPI_MODE0));
  SPI.begin();
  Serial.begin(115200);


  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  timeClient.begin();

  Serial.println("Setup complete");
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println("Loop");
  timeClient.update();
  currentTime = timeClient.getFormattedTime();
  Serial.println(currentTime);
  int second = currentTime.substring(6, 8).toInt();
  if (second == 0) {
    displayClock();
  } else if (digitalRead(BTN_TRIGGER) == LOW) {
    Serial.println("Button is pressed");
    Serial.printf("Function %d calling\n", i % FUNCTION_COUNT);
    functions[i % FUNCTION_COUNT]();
    i += 1;
  }
  delay(1000);
}

void fullScreenRefresh() {
  Serial.println("Full Screen Refresh");
  EPD_HW_Init(); //Electronic paper initialization.			
  Serial.println("EPD_HW_Init");
  EPD_WhiteScreen_ALL(gImage_BW1,gImage_RW1); //To Display one image using full screen refresh.
  Serial.println("EPD_WhiteScreen_ALL");
  EPD_DeepSleep(); //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("EPD_DeepSleep");
  Serial.println("Done");
}

void partialRefresh() {
  Serial.println("Partial Refresh");
  EPD_HW_Init(); //Electronic paper initialization.	
  EPD_SetRAMValue_BaseMap(gImage_BW2,gImage_RW2); //Please do not delete the background color function, otherwise it will cause unstable display during partial refresh.
  for(int i=0;i<6;i++)
    EPD_Dis_Part_Time(24,48+32*0,Num1[i],         //x-A,y-A,DATA-A
                      24,48+32*1,Num1[0],         //x-B,y-B,DATA-B
                      24,48+32*2,gImage_numdot1, //x-C,y-C,DATA-C
                      24,48+32*3,Num1[0],        //x-D,y-D,DATA-D
                      24,48+32*4,Num1[1],32,64); //x-E,y-E,DATA-E,Resolution 32*64
  EPD_DeepSleep();  //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("Done");
}

void partialRefresh2() {
  Serial.println("Partial Refresh 2");
  EPD_HW_Init(); //E-paper initialization	
  EPD_SetRAMValue_BaseMap(gImage_BW2,gImage_RW2); //Please do not delete the background color function, otherwise it will cause unstable display during partial refresh.			
  EPD_Dis_PartAll(gImage_p1); //Image 1
  EPD_Dis_PartAll(gImage_p2); //Image 2
  EPD_Dis_PartAll(gImage_p3); //Image 3
  EPD_Dis_PartAll(gImage_p4); //Image 4
  EPD_Dis_PartAll(gImage_p5); //Image 5	
  EPD_DeepSleep();//Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("Done");
}

void rotated() {
  Serial.println("Rotated");
  EPD_HW_Init_180(); //Full screen refresh initialization.
  EPD_SetRAMValue_BaseMap(gImage_BW1,gImage_RW1); //Please do not delete the background color function, otherwise it will cause unstable display during partial refresh.
  EPD_DeepSleep(); //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("Done");
}

void clear() {
  Serial.printf("Clearing screen\n");
  EPD_HW_Init(); //Full screen refresh initialization.
  // EPD_WhiteScreen_White(); //Clear screen function.
  EPD_WhiteScreen_Black();
  EPD_DeepSleep(); //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("Done");
}

void displayClock() {
  Serial.println("Display Clock");
  EPD_HW_Init(); //Electronic paper initialization.	
  EPD_SetRAMValue_BaseMap(gImage_BW2,gImage_RW2); //Please do not delete the background color function, otherwise it will cause unstable display during partial refresh.
  int hh[2];
  int mm[2];
  hh[0] = currentTime.substring(0, 1).toInt();
  hh[1] = currentTime.substring(1, 2).toInt();
  mm[0] = currentTime.substring(3, 4).toInt();
  mm[1] = currentTime.substring(4, 5).toInt();
  EPD_Dis_Part_Time(24,48+32*0,Num1[mm[1]],         //x-A,y-A,DATA-A
                    24,48+32*1,Num1[mm[0]],         //x-B,y-B,DATA-B
                    24,48+32*2,gImage_numdot1, //x-C,y-C,DATA-C
                    24,48+32*3,Num1[hh[1]],        //x-D,y-D,DATA-D
                    24,48+32*4,Num1[hh[0]],32,64); //x-E,y-E,DATA-E,Resolution 32*64
  EPD_DeepSleep();  //Enter the sleep mode and please do not delete it, otherwise it will reduce the lifespan of the screen.
  Serial.println("Done");
}
