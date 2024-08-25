# RP Navi dependencies

This document is to go over the dependencies of RP Navi (as best as possible) and the role they server

## Core dependencies
These are depencies that are considered foundational for RP Navi.

*   **Node.js:** This is what the server runs on.
*   **MongoDB:** This stores persistent data that's frequently read, but infrequently updated.
*   **Redis:** This stores data that's frequently changing, but does not need to persist. This may also act as a cache for MongoDB data if needed.

## Node.js dependencies
[ TBD when the list finalizes ]