#!/bin/bash

# This script clears out all rooms in Redis. Mostly useful when doing work on the chat room side of
# Socket.IO.
redis-cli keys room* | xargs redis-cli del
redis-cli keys inRoom* | xargs redis-cli del
redis-cli del "publicRomNames"
