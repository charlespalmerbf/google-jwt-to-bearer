const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Parse JSON body
app.use(bodyParser.json());

// Route to handle Apple's server notifications
app.post("/apple-notifications", (req, res) => {
    // Handle the transaction notification data sent by Apple here
    console.log("Received Apple transaction notification:", req.body);

    // Respond with a 200 OK to acknowledge receipt of the notification
    res.status(200).end();
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
