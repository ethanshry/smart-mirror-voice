from websocket import create_connection
import time
ws = create_connection("ws://localhost:8080/websocket")
print("Sending 'Hello, World'...")
time.sleep(3)
ws.send("Hello, World")
print("Sent")
#print("Receiving...")
#result =  ws.recv()
#print("Received '%s'" % result)
ws.close()
