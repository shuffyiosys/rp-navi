# RP Navi System Design

## Architecture
RP Navi uses the Model-View-Controller-Service pattern to separate concerns.

### Model
*   Stores data that needs to survive between server instances.

### View
*   Provides a user interface for the client
*   Handles creating the client side representation of data, if needed
*   Handles inputs from the client

### Controller
*   Validates incoming data. Validation includes.
    * Checking if the required parameters exists.
    * Checking if any optional paramters exist, and if not, fill them in with defaults.
*   Formats outgoing data.
*   Handles sending the response back to the client.
*   Supplementing controllers are routers, which determine which controller function should be called based what URL and HTTP method the client sends.

### Service
*   Handles verifying input data follows business rules
*   Interfaces with the model to write data into the model or read data from it

## Categories of data
The backbone of an interactive application is the data. The data that's being generated, being read, how it's passed around defines how the rest of the application is designed. Categorizing this data helps consolidate what logic needs to be performed and in addition, should help minimize duplication of concerns.

For this project, these are the various categories of data.

### Account
*   Handles authentication (i.e., login name and password)
*   Handles the root level of ownership.
    * e.g., An account owns Data A, which may own Data B.

### Character
*   This is the main entity users interact with other users.
*   Owned by accounts.

### Group
*   Handles a way for users to create a shared interest space.
*   Owned by characters.

### Chat room
*   Handles the data needed for real-time communication between users.
*   Owned by characters.
*   Most data is volatile and should be handled separately from any persistent data storage.

### Verification
*   Handles features that require a challenge-response type action.
*   For example, if a user needs to reset their account password, a verification token is generated and referenced when submitting a password reset.

## General flow of data:

*   [ Client request (URL, HTTP method, data) ] -> Router
*   Router -> Controller method (based on URL and HTTP method)
*   Controller -> Service method
*   Service method return -> Controller
*   Controller response -> Client