# SETTING IT ALL UP
First thing's first
`sudo apt-get update`
`sudo apt-get upgrade`

Then, need to enable the camera module
`sudo raspi-config` and enable the camera module under the `interface` section
Test the camera with `raspistill -v -o test.jpg`

Now to update nodejs
check out [this](http://thisdavej.com/upgrading-to-more-recent-versions-of-node-js-on-the-raspberry-pi/) for more info, but essentially we need to change the node version so run
`curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -`
and then `sudo apt-get install nodejs`
You should now be upgraded from node v.4.x.x to v.9.x.x

Then we'll do a little application setup
create a directory `mirrorCode` on your desktop, and clone the project git repo into this directory.
you'll then want to `cd` into `mirrorCode/FrontEnd` and run `npm install`. Congrats! the node server should be ready to rock and roll. Run `npm start` to test to endure this is all working properly.

Now we need to do a little python config- open up the `Start dev terminal` on the desktop and run `pip list`. Ensure neither `websocket` nor `websocket-client` are installed. Then, run `pip install websocket-client`.

Next we'll configure our OAuth credentials. Go to `console.cloud.google.com` and log in. You'll need to enable the google cloudspeech API and set up an account and project if you haven't already. Then, click on `Go to APIs overview` and then the `Credentials` tab. You'll need to create new credentials, you want a `service account key` in the JSON format. Rename this file `cloud_speech.json` and move it to your `~/home/pi` directory.

Finally, to set up the autoboot. Locate `mirrorlaunch.desktop` in the `HardwareInterface/AutoBoot` folder. Copy this file into `~/home/pi/.config/autostart`. You may have to enable hidden icons with a right click to see `.config`, or create the `autostart` directory if it does not exist. Test this with a quick restart. If successful, everything should be working!