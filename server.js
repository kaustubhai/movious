const express = require("express");
const server = express();
const cors = require("cors");
const dotenv = require("dotenv");
const cp = require("cookie-parser");
dotenv.config();

server.use(cors());
server.use(cp());
server.use(express.json({ extended: false }));

const PORT = (process.env.PORT = 5000);
server.listen(PORT, console.log(`Server is live on ${PORT}`));
