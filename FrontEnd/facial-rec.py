#pylint: disable=e0401
import boto3
import picamera as picam
import sys
import time
#holds final message to be send to js
message = []

cam = picam.PiCamera()

#MODIFY FOR FINAL PROJECT ORIENTATION
cam.vflip = True
cam.hflip = True

cam.capture('unknownFace.jpg')

BUCKET = "tech-reflect-voice-facial-images"
FACE_LIST = ["Ethan","Tony"]
KEY_TARGET = "unknownFace.jpg"
RECOGNIZED_FACE = False
IS_FACE = False
MIN_SIM = 60.0

s3 = boto3.client('s3')
s3.upload_file('unknownFace.jpg', Bucket=BUCKET, Key = KEY_TARGET)

def detect_face(bucket, key, region = "us-east-2", attributes = ['ALL']):
    rekognition = boto3.client("rekognition", region)
    response = rekognition.detect_faces(
        Image={
             "S3Object": {
                "Bucket": bucket,
                "Name": key
             }
        },
        Attributes = attributes,
    )
    return response['FaceDetails']

def compare_faces(bucket, key, bucket_target, key_target, threshold=0, region="us-east-2"):
    rekognition = boto3.client("rekognition", region)
    response = rekognition.compare_faces(
    SourceImage={
     "S3Object": {
        "Bucket": bucket,
        "Name": key,
     }
    },
    TargetImage={
     "S3Object": {
        "Bucket": bucket_target,
        "Name": key_target,
     }
    },
    SimilarityThreshold=threshold,
    )
    return response['SourceImageFace'], response['FaceMatches']

for face in detect_face(BUCKET, KEY_TARGET):
    conf = face['Confidence']
    if(conf >= MIN_SIM):
        message.append("faceDetected:true")
        IS_FACE = True
        
        
if(IS_FACE == True) :
    for face in FACE_LIST:
       FILENAME = face + "Face.jpg"
       source_face, matches = compare_faces(BUCKET, FILENAME, BUCKET, KEY_TARGET)
       for match in matches:
          sim = match['Similarity']
          message.append("simScore:" + str(sim))
          if (sim >= MIN_SIM) :
             message.append("user:" + str(face))
             RECOGNIZED_FACE = True

if (RECOGNIZED_FACE == False):
   message.append("user:undefined")
else:
    message.append("faceDetected:false")

print(str.join(',', message))



# the main source face
#print "Source Face ({Confidence}%)".format(**source_face)

# one match for each target face
#for match in matches:
#  print "Target Face ({Confidence}%)".format(**match['Face'])
#  print "  Similarity : {}%".format(match['Similarity'])

#sim = match['Similarity']
#print sim

