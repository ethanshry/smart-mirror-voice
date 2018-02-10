# smart-mirror-voice
GUI Driver for a smart mirror powered through voice commands

## Launching the Server

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

## Kevin & Pug
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