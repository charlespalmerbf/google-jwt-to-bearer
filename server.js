const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Parse JSON body
app.use(bodyParser.json());

// Route to handle Apple's server notifications
app.post('/apple-notifications', (req, res) => {
  // Handle the transaction notification data sent by Apple here
  console.log('Received Apple transaction notification:', req.body);

  // Respond with a 200 OK to acknowledge receipt of the notification
  res.status(200).end();
});

const options = {
  key: fs.readFileSync('localhost-key.pem'),
  cert: fs.readFileSync('localhost.pem')
};

// Create HTTPS server
const server = https.createServer(options, app);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});

//ssh -R 80:localhost:3000 localhost.run
