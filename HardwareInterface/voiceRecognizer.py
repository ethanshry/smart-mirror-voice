import aiy.audio
import aiy.cloudspeech
import asyncio
import json
import requests

import RPi.GPIO as GPIO


from websocket import create_connection

config = {
    "shouldSpeak": False,
    "shouldTriggerVisualIndicator": False
}

def main():
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(26, GPIO.OUT)
    global config
    recognizer = aiy.cloudspeech.get_recognizer()
    #recognizer.expect_phrase('turn off the light')
    recognizer.expect_hotword('Clara')
    aiy.audio.get_recorder().start()

    while True:
        print('Listening...')
        text = recognizer.recognize()
        if not text:
            print('Sorry, I did not hear you.')
        else:
            print('You said "', text, '"')
            GPIO.output(26, GPIO.HIGH)
            if config['shouldSpeak']: aiy.audio.say("One moment")
            ws = create_connection("ws://localhost:8080/websocket")
            ws.send(text)
            ws.close()
            GPIO.output(26, GPIOO.LOW)

if __name__ == '__main__':
    main()



