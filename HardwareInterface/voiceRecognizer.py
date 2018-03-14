
# pylint: disable=E0401
import aiy.audio
import aiy.cloudspeech
import asyncio
import json
import requests
import time

import RPi.GPIO as GPIO 


from websocket import create_connection

###TODO: implement motion stuffs

config = {
    "shouldSpeak": False,
    "shouldTriggerVisualIndicator": False, #WTH does this do rn
    "wsPort": 8080,
    "wsRequestStrings": {
        "light": "lightrequest",
        "client": "clientpassthrough",
        "audioOutReq": "audiooutrequest",
        "audioOutRes": "audiooutresponse"
    },
    "hotwordList": ["clara"],
    "audioQueue": ""
}

def formatOutgoingWsMsg(command, packet):
    return "~-~" + command + "~.~" + packet + "~_~"

def processIncomingMessage(msg):
    startSeqIndex = msg.find("~-~")
    endSeqIndex = msg.find("~.~")
    termseqIndex = msg.find("~_~")
    return {
        "cmd": msg[startSeqIndex + 3: endSeqIndex],
        "packet": msg[endSeqIndex + 3:termseqIndex]
    }

def sendWsMesage(messageString):
    ws = create_connection("ws://localhost:" + config["wsPort"] + "/websocket")
    ws.send(messageString)
    ws.close()

def audioOutCheck():
    global config
    ws = create_connection("ws://localhost:" + config["wsPort"] + "/websocket")
    ws.send(formatOutgoingWsMsg(config["wsRequestStrings"]["audioOutReq"], "hasrequest"))
    content = ws.recv()
    content = processIncomingMessage(content)
    ws.close()
    if content["cmd"] == config["wsRequestStrings"]["audioOutRes"] and content["packet"] == "noresponse":
        print('Checked audio, nothing to output')
    else:
        print('Outputting audio')
        if config['shouldSpeak']: aiy.audio.say(content['packet'])

def main():
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(31, GPIO.OUT)
    global config
    recognizer = aiy.cloudspeech.get_recognizer()
    #recognizer.expect_phrase('turn off the light')
    #recognizer.expect_hotword('Clara')
    aiy.audio.get_recorder().start()

    while True:
        print('Listening...')
        text = ""
        while (text == None) or any(hotword not in text.lower() for hotword in config["hotwordList"]):
            audioOutCheck()
            text = recognizer.recognize()
        # hotword detected, moving on
        sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"hotwordtriggered"))
        text = recognizer.recognize()
        if not text:
            print('Sorry, I did not hear you.')
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"clear"))
        else:
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"thinking"))
            print('You said "', text, '"')
            GPIO.output(31, GPIO.HIGH)
            
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["client"],text))
            time.sleep(1)
            GPIO.output(31, GPIO.LOW)
            # maybe want this? idk?
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"clear"))

if __name__ == '__main__':
    main()
