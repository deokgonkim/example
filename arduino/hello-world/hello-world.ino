#define BUTTON_PIN D6

void setup() {
  // put your setup code here, to run once:

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  // pinMode(BUTTON_PIN, INPUT);

  Serial.begin(115200);
  Serial.println("The setup is completed");
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println("Begin of loop");

  if(digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("Button LOW");
  } else {
    Serial.println("Button HIGH");
  }

  delay(1000);

  Serial.println("End of loop");
}

void someFunction() {
  Serial.println("Entered someFunction");
}
