'''
    cmdTest.py
    Last Updated- EthanShry 20180321

    Mimics the way ../HardwareInterface/voiceRecognizer.py sends text commands to the client

'''

import json
import requests
import time

from websocket import create_connection

config = {
    "wsPort": 8080,
    "wsRequestStrings": {
        "light": "lightrequest",
        "client": "clientpassthrough",
        "audioOutReq": "audiooutrequest",
        "audioOutRes": "audiooutresponse"
    }
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
    ws = create_connection("ws://localhost:" + str(config["wsPort"]) + "/websocket")
    ws.send(messageString)
    ws.close()

def main():
    global config

    while True:
        text = input("Command? \n>")
        print("sending command '" + text + "'.....")
        sendWsMesage(formatOutgoingWsMsg(config["wsRequestStrings"]["client"],text))

if __name__ == '__main__':
    main()
