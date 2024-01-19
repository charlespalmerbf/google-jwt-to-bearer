require("dotenv").config();

const jwt = require("jsonwebtoken");

const token = process.env.JWT_EXAMPLE;
const decoded = jwt.decode(token);

console.log("Decoded JWT:", decoded);
