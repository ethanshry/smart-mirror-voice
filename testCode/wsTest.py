import websocket 
#import create_connection
#ws = create_connection("ws://localhost:8080/websocket")
#print("Sending 'Hello, World'...")
#ws.send("Hello, World")
#print("Sent")
#print("Receiving...")
#result =  ws.recv()
#print("Received '%s'" % result)
#ws.close()

def onMsg(ws, msg):
    print("recieved: " + msg)

def onErr(ws, err):
    print("err: " + err)

def onClose(ws, close):
    print("connection closed")

def onOpen(ws):
    ws.send("opened!!!")
    ws.send("data")

websocket.enableTrace(True) #???
ws = websocket.WebSocketApp("ws://localhost:8080/",
    on_message = onMsg,
    on_error = onErr,
    on_close = onClose
)
ws.on_open = onOpen
ws.run_forever()