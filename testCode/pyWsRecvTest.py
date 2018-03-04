import json
import requests
import time

from websocket import create_connection

config = {
    "shouldSpeak": False,
    "shouldTriggerVisualIndicator": False
}

def main():

    while True:
        print('Listening...')
        ws = create_connection("ws://localhost:8080/websocket")
        ws.send("/api/wsTest")
        time.sleep(3)
        content = ws.recv()
        ws.close()
        if (content != ""):
            print('recieved' + content)

main()