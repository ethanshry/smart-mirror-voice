# smart-mirror-voice
GUI Driver for a smart mirror powered through voice commands

# Project Tour
Three main parts:

## /testCode
Contains utility files to test various pieces of the project flow

## /HardwareInterface
Contains the python Speech to Text Server

## /FrontEnd
Contains the NodeJS server which handles most everything else
`/GUI` contains all the Pug view templates

`app.js` is the main server code- handles interaction between Python, Client, Arduino, View Routing, Command Parser, Local file Storage, etc

`commandParser.js` handles conversion from the raw speech text to a command outlines in `voiceCommands.js`

`voiceCommands.js` contains all the commands and their related options- from which text activates them to the view to bring up when they are activated and the trigger to use to find appropriate data to associate with the command

`config.js` contains general application level configurations like server ports and API keys

`userData.json` contains user-level data like account keys, style configs, and reminder information

# Launching the Application
Launching the application is annoying and tedious, yay. Hopefully we will have this automated on an actual Pi.

First we want to download the repo to a **raspberry pi** set up using the **Google AIY** distro of raspbian, which can be found [here](https://aiyprojects.withgoogle.com/voice).

Then you'll need to to a ton of Google Cloud configurations, will update that when we are 100% clear on the process. The most important thing is getting an **OAuth Json** file and ensuring it is in the correct folder (which is at the root of the AIY python virtual env, again will update with more specific instructions in the future).

Clone the repo onto your Pi, anywhere will do

Now you'll need to copy `voiceRecognizer.py` from `./HardwareInterface/voiceRecognizer.py` to somewhere in the AIY virtual env. Will update to be more specific, but has to end up in the `examples` folder. It's something like `src/voice/examples`. 

Now, start the nodejs server using `npm start` from the desktop. Then use the **AIY VirtualEnv** terminal to launch `voiceRecognizer.py` from the location we copied it into previously. Finally, open up a browser and navigate to `localhost:3000/nav/main`, or whatever port is specified in `./FrontEnd/config.js`

From that point, the application should be running smoothly!

# Launching the Server

If you know nothing about nodejs, this will get you started.

First, ensure you have downloaded and installed nodejs. It should come with npm as well, which is nodejs's native package manager. If it asks, ensure these are added to your PATH.
You can get nodejs [here](https://nodejs.org/en/)

Then open up a command prompt and verify you have both node and npm installed by executing the following commands:
```
    node -v
    npm -v
```

Finally, you are ready to begin your project. `cd` into the folder you have downloaded the Git Repo to, and ensure you `cd` into the `/FrontEnd` folder.
Then run:
```
npm install
```
And when that has finished:
```
npm run start
```

That's it! The nodejs server is up and running.
*** NOTE: You *MUST* restart the server any time you make a change to the code for the changes to update. Simply `Ctrl+C` in the terminal and `npm start` to restart ***

# Kevin & Pug
Kevin, the folder you'll be dealing with will be FrontEnd/GUI

Each command should have its own **filename.pug** file

You'll want to familiarize yourself with Pug before we get into any real GUI work.

Documentation on Pug can be found [here](https://pugjs.org/api/getting-started.html)

Pug is a templating language, which essentially means that it runs in on the server before being compiled to html and sent to the client, which allows us to pass data to the client easily.

If you open up `FrontEnd/GUI` you should see several files. `PugDemo.pug` is an example page i've set up for you to see a little of how pug works. `KevinDemo.pug` is the page I have set up for you to play around with pug yourself.

Follow the instructions in **Launching the Server** and then

Open any browser and navigate to `https://localhost:3000/PugDemo` to see the demo pug page up and running
Navigate to `https://localhost:3000/KevinDemo` to see the your playground page up and running.

I am also passing you some data so you can see how dealing with data from the server works in Pug. I've left the format of the data commented out at the top of your pug file.

Good Luck! Let me know if you have any questions~

# TODO:
* Callback on hotword for lights --complete
* hotword custom config --in progress
* shorter hotword detection longer sentence detection --tabled
* API integrations (the lot)
* smoother TTCommand parsing --complete
* all the commands and whatnot
* JS -> python comm --complete
* Local file storage
* GUIs
* monitor to kiosk mode on startup --in progress
* monitor vertical