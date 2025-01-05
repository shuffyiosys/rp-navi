# Redis data structure

Redis is used in two scenarios

1. Caching requests from MongoDB. One of the main ones is checking account <-> character ownership to ensure an account can't spoof a character
2. Holding temporary data that doesn't need to be need to be saved to MongoDB, but needs to exist while the server is running and it's not a good idea for the server to hold it. e.g., who's in a room

## Room data keys

-   `room`: Data about a room
    -   `room:[room name]` (hash): Simple data (i.e., not sets or hashes) for a room. This key is also used to determine if a room exists
    -   `room:[room name]:inRoom` (set): Who's in the room
    -   `room:[room name]:mods` (set): Who are the mods (owner implies mod)
    -   `room:[room name]:banned` (set): Who's banned
    -   `room:[room name]:log` (list, JSON strings): Last set of messages

## Account data keys

-   `sess:[session ID]` (string): Sessions. Contains cookie information and the user's account ID. This is handled automatically by express-session
-   `characters:[Account ID]` (set): Data for character ownership. Used to cache character ownership from MongoDB
-   `inRoom:[Account ID]` (hash): Data for storing how many are in a room using a hash structure (key = room name, value = counter)

## Character data keys

-   `characterStatus:[Character Name]` (hash): Status about a character

## Data with multi keys

-   `owner` (hash): Reverse relationship of `characters:[Account ID]` (key = character name, value = user ID)
