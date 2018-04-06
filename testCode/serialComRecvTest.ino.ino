/*
  Serial Call and Response
  Language: Wiring/Arduino

  This program sends an ASCII A (byte of value 65) on startup and repeats that
  until it gets some data in. Then it waits for a byte in the serial port, and
  sends three sensor values whenever it gets a byte in.

  The circuit:
  - potentiometers attached to analog inputs 0 and 1
  - pushbutton attached to digital I/O 2

  created 26 Sep 2005
  by Tom Igoe
  modified 24 Apr 2012
  by Tom Igoe and Scott Fitzgerald
  Thanks to Greg Shakar and Scott Fitzgerald for the improvements

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/SerialCallResponse
*/
int gLed = 8;
int rLed = 9;
int bLed = 10;

void setup() {
  // start serial port at 9600 bps:
  Serial.begin(115200);
  pinMode(rLed, OUTPUT);
  pinMode(gLed, OUTPUT);
  pinMode(bLed, OUTPUT);
}

void loop() {
  // if we get a valid byte, read analog ins:
  if (Serial.available() > 0) {
    // get incoming byte:
    char inByte = Serial.parseInt();
    if (inByte == 110) {
      digitalWrite(gLed, HIGH);
      delay(2000);
      digitalWrite(gLed, LOW);
    } else if (inByte == 120) {
      digitalWrite(rLed, HIGH);
      delay(2000);
      digitalWrite(rLed, LOW);
    } else if (inByte == 130) {
      digitalWrite(bLed, HIGH);
      delay(2000);
      digitalWrite(bLed, LOW);
    }
  }
}
