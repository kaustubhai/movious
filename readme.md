# Movious
### A full fledged movie/shows ticket booking website API

<br/>

## Features included:
- Seperate Admin and user auth
- Creating multiple shows in one theater
- Pay later option while booking ticket
- Real Payment integration with Stripe
- Booking confirmation email with ticket

## Setting up locally
Run following command in your terminal
```bash
    git clone https://github.com/kaustubhai/movious.git
    cd movious
    npm install
```
Setup the required variable in .env.local file and run
```bash
    npm run dev
```
This will start backend server on http://localhost:5000 using nodemon

## Tech Stack Used:
- Node
- Express
- PostgreSQL

## Dependencies:
- bcrypt: encryption of password
- cookie-parser: cookie parsing in req object
- cors: enabling cross-origin-requests
- dotenv: configuring environment variables
- express: faster service
- jsonwebtoken: user authentication 
- multer: poster handling of events
- nodemailer: ticket booking confirmation email
- pg: postgres queries handler
- sharp: minifying heavy uploaded images
- stripe: payment handling
- nodemon: (DevDependency) Server Restart in dev mode

## Database Schema used:
![schema](https://i.imgur.com/0fQNFxP.jpeg)

## Backend Routes:
![routing](https://i.imgur.com/Bogo55Z.jpeg)

