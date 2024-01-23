# Project Title: node server App

## Description

The project is a Node.js-based application designed for managing user and business-related data. It involves building a REST API, emphasizing on server-side development with a deep understanding of relevant technologies and libraries like Express.js, MongoDB, and others. Key features include user registration, login, content publication, and editing. The project also incorporates advanced features like a file logger for tracking errors and a security mechanism for temporary user account lockout. The application is structured to provide a comprehensive and secure user experience, focusing on clean, well-organized code and efficient data handling.

## Technologies Used

- Node.js
- Express
- MongoDB

## Used Packages

1. **bcrypt (5.1.1)**: A library to help hash passwords for secure storage.
2. **chalk (4.1.2)**: Enables styling of terminal string output with colors.
3. **cors (2.8.5)**: Middleware to enable Cross-Origin Resource Sharing in your Express app.
4. **cross-env (7.0.3)**: Sets and uses environment variables across platforms.
5. **dotenv (16.3.1)**: Loads environment variables from a .env file into process.env.
6. **express (4.18.2)**: Web framework for creating server-side applications in Node.js.
7. **joi (17.11.0)**: Object schema validation tool.
8. **jsonwebtoken (9.0.2)**: Implements JSON Web Tokens for secure data transmission.
9. **lodash (4.17.21)**: Utility library providing convenience functions for common programming tasks.
10. **mongoose (8.0.3)**: MongoDB object modeling tool designed to work in an asynchronous environment.
11. **morgan (1.10.0)**: HTTP request logger middleware for Node.js.
12. **passport (0.7.0)**: Authentication middleware for Node.js.
13. **uuid (9.0.1)**: Creates unique identifiers (UUIDs).

## Installation

Install the node_modules

```shell
npm install
```

## Running the Project

- To start the application in production mode:

```shell

  npm start
```

This sets NODE_ENV to 'production' and runs the app using Node.js.

- For development mode with auto-restart:

```shell

npm run dev
```

This sets NODE_ENV to 'development' and runs the app with nodemon for hot reloading.

- To seed the database with initial data:

```shell

npm run seed-db
```

Runs the seeding script to populate your database with initial data.

## Available Routes

- Here you can find API addresses that the server will respond to:

  ### -users api

Register a new user

```shell
  POST /api/users

```

Login a user

```shell
POST /api/login

```

Get my user(me)

```shell
GET /api/users/me
```

Get all users(only admin)

```shell
GET /api/users
```

Get user by id (only the registered user or admin)

```shell
GET /api/users/:id
```

Edit user by id (only the registered user)

```shell
PUT /api/users/edit/:id
```

Change user status(regular/business) (only the registered user)

```shell
PATCH /api/users/:id
```

Change user status to admin(Only an admin type user can make the request)

```shell
PATCH /api/users/admin/:id
```

Delete user

```shell
DELETE /api/users/:id
```

### -A link to requests in Postman includes a description of what should be put in the body of the request and examples

[API Documentation](https://documenter.getpostman.com/view/27577545/2s9YsQ6UPy)

### -cards api

create card(Must be a business user to create cards)

```shell
POST /api/cards
```

Get all cards

```shell
GET /api/cards
```

Get card by id

```shell
GET /api/cards/id:
```

Delete card( only the user who created the card or admin)

```shell
Delete /api/cards/id:
```

Get my cards(only the registered user)

```shell
GET /api/cards/my-cards
```

Like card(only the registered user)

```shell
PATCH /api/cards/id:
```

Edit card( only the user who created the card )

```shell
PUT /api/cards/edit/id:
```

chang bizNumber( only admin )

```shell
PATCH /api/cards/editBiz/id:
```

### -A link to requests in Postman includes a description of what should be put in the body of the request and examples

[API Documentation](https://documenter.getpostman.com/view/27577545/2s9YsQ6UF7)

## Security Features

### Temporary Account Lock

If a user attempts to log in with the same email address and fails due to incorrect password entry three consecutive times, their account will be temporarily locked for a period of 24 hours. This measure is designed to prevent unauthorized access attempts and safeguard user data.

#### How it Works:

- **Lockout Trigger**: After three consecutive failed login attempts with the same email.
- **Lockout Duration**: The user's account will be locked for 24 hours.
- **Account Recovery**: Users can contact support for assistance or wait until the lockout period expires to regain access.

## Application Logging

### Error Logging

Our application includes an advanced error logging system to enhance monitoring and debugging. This system automatically captures and logs all requests that result in a status code of 400 or higher.

#### Features:

- **Log File Creation**: For each day, the logger creates a new log file in the `logs` directory. The log file is named after the current date (e.g., `2024-01-17.log`). If a file with that date already exists, the logger appends to the existing file.
- **Log Content**: Each log entry includes the date and time of the request, the response status code, and the error message.
- **Log Directory**: All logs are stored in the `logs` directory at the root of the application.

This logging system ensures that all critical errors are recorded, aiding in quick identification and resolution of issues affecting our users.
