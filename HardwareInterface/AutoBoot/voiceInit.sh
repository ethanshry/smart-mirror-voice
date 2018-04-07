#!/bin/bash

cd ~/bin

source /etc/bash.bashrc
source ~/.bashrc
cat /etc/aiyprojects.info

cd ~/AIY-projects-python
source env/bin/activate

echo "Setup python environment"
echo "Initializing Voice Recognizer..."

cd ~/Desktop/mirrorCode/HardwareInterface
python voiceRecognizer.py

bash