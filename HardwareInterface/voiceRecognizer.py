'''
    voiceRecognizer.py
    Last Updated- EthanShry 20180321

    Runs in the aiy/src/voice/examples folder

    Handles speech input and STT processing, audio output, and monitors active user profile and mirror is active status

'''
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
    "wsPort": "8080",
    "wsRequestStrings": {
        "light": "lightrequest",
        "client": "clientpassthrough",
        "audioOutReq": "audiooutrequest",
        "audioOutRes": "audiooutresponse",
        "switchUserReq": "shouldswitchuserrequest",
        "switchUserRes": "shouldswitchuserresponse",
        "checkIsActiveReq": "activestatusrequest",
        "checkIsActiveRes": "activestatusresponse"
    },
    "hotwordList": ["clara"],
    "audioQueue": "",
    "mirrorIsActive": True
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

#UNTESTED
def userSwitchCheck():
    global config
    ws = create_connection("ws://localhost:" + config["wsPort"] + "/websocket")
    ws.send(formatOutgoingWsMsg(config["wsRequestStrings"]["switchUserReq"], "shouldswitch"))
    content = ws.recv()
    content = processIncomingMessage(content)
    ws.close()
    if content["cmd"] == config["wsRequestStrings"]["switchUserRes"] and content["packet"] == "noswitch":
        print('Same user')
    else:
        # new user data will come in form Username:hotwordA,hotwordB,...
        newuser = content["packet"].split(':')
        config["hotwordList"] = newuser[1].split(',')
        print('New User, welcome ', newuser[0])
        if config['shouldSpeak']: aiy.audio.say("Welcome " + str(newuser[0]))

#UNTESTED
def isActiveCheck():
    global config
    ws = create_connection("ws://localhost:" + config["wsPort"] + "/websocket")
    ws.send(formatOutgoingWsMsg(config["wsRequestStrings"]["checkIsActiveReq"], "isactive"))
    content = ws.recv()
    content = processIncomingMessage(content)
    ws.close()
    if content["cmd"] == config["wsRequestStrings"]["checkIsActiveRes"] and content["packet"] == "n":
        config["mirrorIsActive"] = False
    else:
        config["mirrorIsActive"] = True

def main():
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(31, GPIO.OUT)
    global config
    recognizer = aiy.cloudspeech.get_recognizer()
    #recognizer.expect_phrase('turn off the light')
    #recognizer.expect_hotword('Clara')
    aiy.audio.get_recorder().start()
    # Visual indicator for kiosk testing
    GPIO.output(31, GPIO.HIGH)
    time.sleep(.2)
    GPIO.output(31, GPIO.LOW)
    time.sleep(.2)
    GPIO.output(31, GPIO.HIGH)
    time.sleep(.2)
    GPIO.output(31, GPIO.LOW)
    time.sleep(.2)
    GPIO.output(31, GPIO.HIGH)
    time.sleep(.2)
    GPIO.output(31, GPIO.LOW)
    while True:
        print('Listening...')
        text = ""
        # would love to better break all this stuff up somehow
        while (text == None) or not any(hotword in text.lower() for hotword in config["hotwordList"]):
            if config["mirrorIsActive"] == False:
                # will this delay anything? who knows man
                isActiveCheck()
                time.sleep(3)
            else:
                # perhaps need to check less than ebery cycle? will expirement
                isActiveCheck()
                audioOutCheck()
                userSwitchCheck()
                text = recognizer.recognize()
        # hotword detected, moving on
        # Visual indicator for kiosk testing
        GPIO.output(31, GPIO.HIGH)
        sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"hotwordtriggered"))
        text = recognizer.recognize()
        # Visual indicator for kiosk testing
        GPIO.output(31, GPIO.LOW)
        if not text:
            print('Sorry, I did not hear you.')
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"clear"))
        else:
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"thinking"))
            print('You said "', text, '"')
            
            
            sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["client"],text))
            
            # maybe want this? idk?
            #sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["light"],"clear"))

if __name__ == '__main__':
    main()
