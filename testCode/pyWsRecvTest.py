import json
import requests
import time

from websocket import create_connection

#import asyncio
#import websockets

config = {
    "shouldSpeak": False,
    "shouldTriggerVisualIndicator": False
}

def processIncomingMessage(msg):
    startSeqIndex = msg.find("~-~")
    endSeqIndex = msg.find("~.~")
    termseqIndex = msg.find("~_~")
    return {
        'cmd': msg[startSeqIndex + 3: endSeqIndex],
        'packet': msg[endSeqIndex + 3:termseqIndex]
    }


def main():

    while True:
        print('Listening...')
        ws = create_connection("ws://localhost:8080/websocket")
        time.sleep(3)
        ws.send("~-~audiooutrequest~.~hasRequest~_~")
        content = ws.recv()
        content = processIncomingMessage(content)
        ws.close()
        print(content['cmd'])
        print(content['packet'])
        if content['packet'] == 'noresponse':
            print('Will not output audio')
        '''if (content != ""):
            print('recieved' + content)
        '''

main()

'''
def process(message):
    print(message)

async def serverRecipient(websocket, path):
    while True:
        print('in the recipient')
        async for message in websocket:
            await process(message) #websocket.send(message)
serverInit = websockets.serve(serverRecipient, 'localhost', 9393)
print('check1')
asyncio.get_event_loop().run_until_complete(serverInit)
print('check2')
asyncio.get_event_loop().run_forever()
print('check3')
while True:
    print("chillin hardcore")
    time.sleep(1)
'''