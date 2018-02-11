import aiy.audio
import aiy.cloudspeech
import asyncio
import json
import websockets
import requests

from websocket import create_connection

def main():
    recognizer = aiy.cloudspeech.get_recognizer()
    #recognizer.expect_phrase('turn off the light')
    recognizer.expect_hotword('Pi')
    aiy.audio.get_recorder().start()

    while True:
        print('Listening...')
        text = recognizer.recognize()
        if not text:
            print('Sorry, I did not hear you.')
        else:
            print('You said "', text, '"')
            aiy.audio.say("One moment")
            ws = create_connection("ws://localhost:8080/websocket")
            ws.send(text)
            ws.close()

if __name__ == '__main__':
    main()


