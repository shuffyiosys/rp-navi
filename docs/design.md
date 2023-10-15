# Directory structure

## backend

Contains code for running the server.

### classes

Stores classes used by the server.

### config

Stores the .env configs and the config processor.

### controllers

Stores controller code, which processes input data and figures out how to send responses.

### data

Stores constant data items such as enums.

### loaders

Stores code to load and configure various aspects of the server, such as setting up a database connection, middleware, etc.

### models

Stores the models used for the database

### routes

Stores how the server responds to HTTP requests from the client

### services

Stores code on how to interact with the model and controller

### sockets

Stores code to run socket.io handlers

### test

Unit test framework

### utils

Utility functions

# Architecture

This web app uses the Model, View, Controller, Service architecture. This is defined as the following

-   **Model**: The data used by the app, which resides in a database of some sort
-   **View**: The client-side presentation of the model
-   **Controller**: Handles the direction of data coming in and data going out.
    -   For inputs, figures out which service to run and which view to display
    -   For outputs, figures out how to send the data back for either page rendering or an AJAX-type response
-   **Service**: Processes the data for either storing into the model or retrieving from the model

# Models

## Account

-   Email is the login name. This follows how most other sites work, and needs to be unique anyway
-   Password is hashed

**Data**

-   Email
-   Password
-   State

# Controllers

Controllers handle the direction of dataflow between the client and the server. They accept requests from the client and end with a response to the client. The only logic they should have is with regards to the data they're shuttling around.
