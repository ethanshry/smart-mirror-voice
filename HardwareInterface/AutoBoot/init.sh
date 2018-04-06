# file to autoboot the mirror to the correct location
echo "Booting..."
echo "Booting server..."
lxeterminal -e "cd ../../FrontEnd && npm start"
echo "Booting browser..."
lxeterminal -e "stall.py && chromium-browser --kiosk http://localhost:3000"

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

