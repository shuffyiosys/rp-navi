# rp-navi

Web-based chat app for meant for RP sessions

# Environment setup
This app was developed on Ubuntu Server 22.0x LTS. The client portion was tested on Mozilla Firefox.

## Required applications

*   Node.js
*   MongoDB
*   Redis

## Required Node.js global packages

*   nodemon
*   PM2
*   Mocha

# Running

Use the command `npm run [Command]` in the ./backend directory. The following commands are supported:

-   `dev`: Used for development purposes. This uses ``nodemon`` to automatically restart the server if changes are made
-   `start`: Used in production. This uses ``PM2`` to automatically manage it
-   `test`: Used to run unit tests, which uses ``Mocha``
