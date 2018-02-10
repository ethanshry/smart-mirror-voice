import aiy.audio
import aiy.cloudspeech
import asyncio
import json
import websockets
import requests

#from websocket import create_connection

async def sendData(uri, data):
    print('preparing transmission')
    async with websockets.connect(uri) as websocket:
        print('transmitting')
        await websocket.send(json.dumps(data))

def main():
    recognizer = aiy.cloudspeech.get_recognizer()
    #recognizer.expect_phrase('turn off the light')
    recognizer.expect_hotword('mirror mirror on the wall')
    #button = aiy.voicehat.get_button()
    #led = aiy.voicehat.get_led()
    aiy.audio.get_recorder().start()

    while True:
        #print('Press the button and speak')
        #button.wait_for_press()
        print('Listening...')
        text = recognizer.recognize()
        if not text:
            print('Sorry, I did not hear you.')
        else:
            print('You said "', text, '"')
            #asyncio.get_event_loop().run_until_complete(
            #    sendData("ws://localhost:3000", {"message": text})
            #)
            r = requests.post('http://localhost:3000/send/', data = {'msg': text})
            #ws = create_connection("ws://localhost:3000/")
            #ws.send(json.dumps({"datasend": "text"}))
            #result = ws.recv()
            #print(result)
            #time.sleep(1)
            #ws.close()
            
            #ws = yield from websockets.connect("ws://localhost:3000");
            #ws.send({"datasend":text})

if __name__ == '__main__':
    main()


