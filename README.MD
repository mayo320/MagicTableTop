# Magic TableTop

## Description
Magic TableTop is a project similar to [Smart Mirrors](https://www.postscapes.com/diy-smart-mirrors/) where it uses a two-way mirror for reflection and displaying the content of the monitor hidden behind the mirror. However the aim for Magic TableTop is to allow users to play table top games on the surface of the mirror, making expensive table top games accessible to anyone with a Magic TableTop.

This project is a framework that allows user to freely create their own tabletop games. Currently Avalon, One Night Ultimate Werewolf, Splendor and Pong are included by default.

## The Idea
You have a laptop that acts as the server (the table) where it displays information that all players can see, and each player will use their phone to connect to said server (they should be in the same local network, ie same wifi). The phone will act as the player's hand, showing information specific to that player. (This is good for identity-games like Avalon, One Night Ultimate Werewolf and such)

## Getting started
The following APIs are used
* [npm](https://www.npmjs.com/)
* [electronjs](https://electronjs.org/)
* [expressjs](https://expressjs.com/)
* [socket.io](https://socket.io/)
* [helmet](https://github.com/helmetjs/helmet)

### Installation
* **Windows**: Download the [zip here](https://github.com/imjackyan/MagicTableTop/releases) (Currently only built for Windows x64 systems)
Then extract and run MagicTableTop.exe.
* **Unix**: See **Installation for Devs**

### Installation for Devs
Install [nodejs](https://nodejs.org/en/download/)

Clone this git repo
```
git clone https://github.com/imjackyan/MagicTableTop
```
Navigate to the project folder "MagicTableTop"
```
cd MagicTableTop
```
Install used APIs (use sudo if on Unix system)
Or just
```
npm install
```
Now try running the project
```
npm start
```
### Playing it
The server will start up and a url will be displayed, players will then visit this url on their phone browser. From then on it self explanatory
