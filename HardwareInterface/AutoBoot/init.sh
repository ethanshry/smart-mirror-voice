#!/bin/bash
# file to autoboot the mirror to the correct location
echo "Booting..."
echo "Booting server..."
cd ~/Desktop/mirrorCode/HardwareInterface/AutoBoot
lxterminal --command bash nodeInit.sh
echo "Booting browser..."
python stall.py
lxterminal --command bash voiceInit.sh

#open chromium incognito to avoid "restore session" popup
lxterminal --command chromium-browser --kiosk --incognito http://localhost:3000/nav/main

bash
