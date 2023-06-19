# Architecture
This web app uses the Model, View, Controller, Service architecture. This is defined as the following

- **Model**: The data used by the app
- **View**: The client-side presentation of the model
- **Controller**: Handles the direction of data coming in and data going out. i.e., figures out which service to run and which view to display
- **Service**: Manipulates the data and performs business logic

# Models
## Account

-   Email is the login name. This follows how most other sites work, and needs to be unique anyway
-   Password is hashed
