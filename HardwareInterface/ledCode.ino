#include <FastLED.h>

#define LED_PIN       5
#define NUM_LEDS      127
#define BRIGHTNESS    32
#define LED_TYPE      WS2812B
#define COLOR_ORDER   GRB
#define BOTTOM_START  27+36
#define LEFT_START    27
#define TOP_START     0
#define RIGHT_START   28+36+27
#define LEFT_LENGTH   36

#define COOLING 55
#define SPARKING 120

CRGB leds[NUM_LEDS];

#define FRAMES_PER_SECOND 60
bool gReverseDirection = false;
int mode = -1;
int r, g, b, del, brightness, sides; //parameters; sides works as follows: sides & B0001 is top, B0010 is left, B0100 is bottom, B1000 is right
//Brightness, Sides do not do anything yet
boolean blockForMode = false;//Force a mode read
boolean blockForParams = true;//Force reading parameters
int startPos = BOTTOM_START + 14; //Middle of the bottom row of LED's, change to match for final code

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  delay(3000);
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection( TypicalLEDStrip);
  FastLED.setBrightness( BRIGHTNESS);
}

void loop() {
  if (blockForMode) {
    while (!Serial.available()) {}
    blockForMode = false;
  }
  if (Serial.available()) {
    mode = Serial.parseInt();
    Serial.println(mode);
    blockForParams = true;
  }
  if (mode == 1) { //BREATHING
    //TEST FORCE READ PARAMS
    if (blockForParams) {
      loadParams();
    }
    for (int i = 0; i < 255; i++) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
    delay(100);
    for (int i = 255; i >= 0; i--) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
  }
  else if (mode == 0) { //TURN LEDS OFF
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CRGB::Black;
    }
    FastLED.show();
    blockForMode = true;
  }
  else if (mode == 2) { //SPIRAL UP TO TOP FROM BOTH SIDES
    blockForMode = true;
    if (blockForParams) {
      loadParams();
    }
    for (int i = 0; i < 63; i++) {
      int ptr = startPos + i;
      if(ptr >= NUM_LEDS) {
        ptr -= NUM_LEDS;
      }
      leds[ptr] = CRGB(r, g, b);
      ptr = startPos - i - 1;
      if (ptr < 0)
        ptr += NUM_LEDS;
      leds[ptr] = CRGB(r, g, b);
      FastLED.show();
      delay(del);
    }
    leds[13] = CRGB(r, g, b);
    FastLED.show();
  }
  else if (mode == 3) { //SOLID ON
    blockForMode = true;
    if (blockForParams) {
      loadParams();
    }
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = CRGB(i * r / 256, i * g / 256, i * b / 256);
    }
    FastLED.show();
  }
  else if (mode == 4) { //FIRE MODE LEFT AND RIGHT SIDES
    Fire2012(RIGHT_START);
    copyLeftRightSides();
    FastLED.show();
    delay(1000 / FRAMES_PER_SECOND);
  }
  else if (mode == -1) { //WHILE WAITING FOR STARTUP SEQUENCE
    r = random8();
    g = random8();
    b = random8();
    CRGB color = CRGB(r, g, b);
    for (int i = 0; i < NUM_LEDS; i++) {
      leds[i] = color;
      FastLED.show();
      delay(50);
    }
  }
  else if (mode == 5) { //EPILEPSY
    for (int i = 0; i < NUM_LEDS; i++) {
      r = random8();
      g = random8();
      b = random8();
      CRGB color = CRGB(r, g, b);
      leds[i] = color;
    }
    FastLED.show();
    delay(20);
  }
  if (mode == 6) { //BREATHING FOR BLUE, NO PARAM INPUT
    r = 0; g = 0; b = 255; del = 3;
    for (int i = 0; i < 255; i++) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
    delay(del*5);
    for (int i = 255; i >= 0; i--) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
  }
  if (mode == 7) { //BREATHING FOR GREEN, NO PARAM INPUT
    r = 0; g = 255; b = 0; del = 3;
    for (int i = 0; i < 255; i++) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
    delay(del*5);
    for (int i = 255; i >= 0; i--) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
  }
  if (mode == 8) { //BREATHING FOR RED, NO PARAM INPUT
    r = 255; g = 0; b = 0; del = 3;
    for (int i = 0; i < 255; i++) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
    delay(del*5);
    for (int i = 255; i >= 0; i--) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
  }
  else if (mode == 9) { //SPIRAL UP TO TOP FROM BOTH SIDES BLUE
    blockForMode = true;
    r = 0; g = 127; b = 255; del = 5;
    for (int i = 0; i < 63; i++) {
      int ptr = startPos + i;
      if(ptr >= NUM_LEDS) {
        ptr -= NUM_LEDS;
      }
      leds[ptr] = CRGB(r, g, b);
      ptr = startPos - i - 1;
      if (ptr < 0)
        ptr += NUM_LEDS;
      leds[ptr] = CRGB(r, g, b);
      FastLED.show();
      delay(del);
    }
    leds[13] = CRGB(r, g, b);
    FastLED.show();
  }
  else if (mode == 10) { //SPIRAL UP TO TOP FROM BOTH SIDES RED
    blockForMode = true;
    r = 255; g = 0; b = 127; del = 5;
    for (int i = 0; i < 63; i++) {
      int ptr = startPos + i;
      if(ptr >= NUM_LEDS) {
        ptr -= NUM_LEDS;
      }
      leds[ptr] = CRGB(r, g, b);
      ptr = startPos - i - 1;
      if (ptr < 0)
        ptr += NUM_LEDS;
      leds[ptr] = CRGB(r, g, b);
      FastLED.show();
      delay(del);
    }
    leds[13] = CRGB(r, g, b);
    FastLED.show();
  }
  else if (mode == 11) { //SPIRAL UP TO TOP FROM BOTH SIDES GREEN
    blockForMode = true;
    r = 127; g = 255; b = 0; del = 5;
    for (int i = 0; i < 63; i++) {
      int ptr = startPos + i;
      if(ptr >= NUM_LEDS) {
        ptr -= NUM_LEDS;
      }
      leds[ptr] = CRGB(r, g, b);
      ptr = startPos - i - 1;
      if (ptr < 0)
        ptr += NUM_LEDS;
      leds[ptr] = CRGB(r, g, b);
      FastLED.show();
      delay(del);
    }
    leds[13] = CRGB(r, g, b);
    FastLED.show(); 
  }
  else if (mode == 12) { //RANDOMIZED BREATHING
    r = random8(); g = random8(); b = random8(); del = 3;
    for (int i = 0; i < 255; i++) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
    delay(del*5);
    for (int i = 255; i >= 0; i--) {
      for (int j = 0; j < NUM_LEDS; j++) {
        leds[j] = CRGB(i * r / 256, i * g / 256, i * b / 256);
      }
      FastLED.show();
      delay(del);
    }
  }
  else if(mode == 13) { //RANDOMIZED SPIRAL UP BOTH SIDES
    blockForMode = true;
    r = random8(); g = random8(); b = random8(); del = 5;
    for (int i = 0; i < 63; i++) {
      int ptr = startPos + i;
      if(ptr >= NUM_LEDS) {
        ptr -= NUM_LEDS;
      }
      leds[ptr] = CRGB(r, g, b);
      ptr = startPos - i - 1;
      if (ptr < 0)
        ptr += NUM_LEDS;
      leds[ptr] = CRGB(r, g, b);
      FastLED.show();
      delay(del);
    }
    leds[13] = CRGB(r, g, b);
    FastLED.show();
  }
}

void loadParams() {
  Serial.println("ACK"); //TELL PI ARDUINO IS READY FOR PARAMETERS
  while (!Serial.available()) {}
  r = Serial.parseInt();
  Serial.println("K");
  while (!Serial.available()) {}
  g = Serial.parseInt();
  Serial.println("K");
  while (!Serial.available()) {}
  b = Serial.parseInt();
  Serial.println("K");
  while (!Serial.available()) {}
  del = Serial.parseInt();
  Serial.println("K");
//  while (!Serial.available()) {}
//  brightness = Serial.parseInt();
//  Serial.println("K");
//  while (!Serial.available()) {}
//  sides = Serial.parseInt();
  blockForParams = false;
}

void Fire2012(int start)
{
  // Array of temperature readings at each simulation cell
  static byte heat[LEFT_LENGTH];

  // Step 1.  Cool down every cell a little
  for ( int i = 0; i < LEFT_LENGTH; i++) {
    heat[i] = qsub8( heat[i],  random8(0, ((COOLING * 10) / LEFT_LENGTH) + 2));
  }

  // Step 2.  Heat from each cell drifts 'up' and diffuses a little
  for ( int k = LEFT_LENGTH - 1; k >= 2; k--) {
    heat[k] = (heat[k - 1] + heat[k - 2] + heat[k - 2] ) / 3;
  }

  // Step 3.  Randomly ignite new 'sparks' of heat near the bottom
  if ( random8() < SPARKING ) {
    int y = random8(7);
    heat[y] = qadd8( heat[y], random8(160, 255) );
  }

  // Step 4.  Map from heat cells to LED colors
  for ( int j = 0; j < LEFT_LENGTH; j++) {
    CRGB color = HeatColor( heat[j]);
    int pixelnumber;
    if ( gReverseDirection ) {
      pixelnumber = (LEFT_LENGTH - 1) - j;
    } else {
      pixelnumber = j;
    }
    leds[pixelnumber + start] = color;
  }
}

void copyLeftRightSides() {
  for (int i = 0; i < LEFT_LENGTH; i++) {
    leds[LEFT_START + LEFT_LENGTH - i - 1] = leds[RIGHT_START + i];
  }
}


