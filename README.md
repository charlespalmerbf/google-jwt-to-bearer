JWT to Bearer Converter
=======================

This is a Node.js script that converts a JSON Web Token (JWT) into a Bearer token by making a request to the Google OAuth 2.0 API.

Prerequisites
-------------

Before running this script, ensure you have the following:

-   Node.js installed on your machine.
-   A Google Cloud Platform (GCP) service account with the necessary credentials:
    -   `SERVICE_ACCOUNT_EMAIL`: The email address of the service account.
    -   `PRIVATE_KEY`: The private key associated with the service account.
    -   `CLAIM_SET_SCOPE`: The scope(s) of the token.

Installation
------------

1.  Clone this repository:

    `git clone https://github.com/charlespalmerbf/google-jwt-to-bearer`

2.  Navigate to the project directory:

    `cd google-jwt-to-bearer`

3.  Install the required dependencies:

    `npm install`

4.  Set up your environment variables by creating a `.env` file and populating it with the required values:

    `SERVICE_ACCOUNT_EMAIL=your-service-account-email@example.com
    PRIVATE_KEY=your-service-account-private-key
    CLAIM_SET_SCOPE=desired-scope`

Usage
-----

To convert a JWT to a Bearer token, execute the following command:

`node jwt.js`

The script will make a request to the Google OAuth 2.0 API and log the response JSON to the console.

Note: If any errors occur during the execution, they will also be logged to the console.

License
-------

This project is licensed under the [MIT License](https://opensource.org/license/mit/). Feel free to modify and use it according to your needs.

Disclaimer
----------

This script is provided as-is without any warranty. Use it at your own risk.
