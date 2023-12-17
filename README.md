Validating a Google subscription receipt
=======================

This is a Node.js script that can be used to validate Google Play Store receipts for Android in-app purchases using server-side validation. It leverages Google's Android Publisher API to verify subscriptions and products.

Prerequisites
-------------

Before running this script, ensure you have the following:

-   Node.js installed on your machine.
-   These values in a .env file:
    - `TTP_USER_PASSWORD`: Your user password
    - `API_BASE`: Base URL for the API
    - `ANDROID_BUNDLE_ID`: Your Android app's bundle ID
 
Usage
-----
The provided Node.js script can be used to validate a users latest in app subscription using their purchase token. 

The purchase token is saved to the users account at the point of purchase and is returned at the point of login within the `lastpaymenttoken` field.

To validate an Android subscription, we make a `GET` request to this url:

`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${process.env.ANDROID_BUNDLE_ID}/purchases/${type}/${fullReceipt.productId}/tokens/${fullReceipt.purchaseToken}?access_token=${accessTokenInfo.access_token}`

-   To this url, we pass five values:
    - `process.env.ANDROID_BUNDLE_ID`: This is the applications bundle id, and comes from the .env file.
    - `type`: This indicates if we are verifying a sandbox or production purchase.
    - `fullReceipt.productId`: This is the product id from the most recent subscription purchase, this comes from the `lastpaymenttoken` retrieved from the user login.
    - `fullReceipt.purchaseToken`: This is the token for the most recent subscription purchase, this comes from the `lastpaymenttoken` retrieved from the user login.
    - `accessTokenInfo.access_token`: This value comes from the jwt to bearer function we have already implemented.
      
Verifying an Android subscriptions validity
-----

To validate an Android subscription, we should first ensure that the subscription we are trying to validate is an Android subscription, this can be done by checking the payment platform specified on the Subscription record in Joomla.

We then need both the `productId` and `purchaseToken` from the `lastpaymenttoken`, which will need to be parsed first as its stored as a stringified json object, if either of these attributes are unavailable, we should not attempt to validate the subscription. (This may be the case for some legacy accounts which will need to be ported over manually.)

-   When checking if a subscription is valid, we can use three values returned within the data object when making a `GET` request to the url above:
    - `expiryTimeMillis`: The expiry time of the most recent subscription, in ms (milliseconds).
    - `autoRenewing`: If the subscription is set to auto renew. This will be a boolean value.
    - `cancelReason`: This value will represent the reasoning behind the user cancelling their subscription, a data map has been provided within the Node.js script to cover the available reasonings.
 
If the active subscription IS NOT past its expiry time, IS marked as auto renewing and DOES NOT have a `cancelReason` attribute, we can consider this subscription valid.

If the active subscription IS NOT past its expiry, but ISN'T marked as auto renewing and has a `cancelReason`, the subscription should remain active BUT should be marked as cancelled in Joomla, this will then restrict access at the end of the billing period. 

The Node.js script logs an `isValid` calculation to the console factoring in the scenario described above.

Validating an Apple subscription receipt
=======================

This Node.js script allows you to validate Apple subscription receipts using the iTunes verifyReceipt endpoint. It checks the validity of a subscription based on the latest receipt information and provides insights into the subscription's status, expiration, and auto-renewal.

Prerequisites
-------------

Before running this script, ensure you have the following:

-   Node.js installed on your machine.
-   These values in a .env file:
    - `TTP_USER_PASSWORD`: Your user password
    - `API_BASE`: Base URL for the API
    - `IOS_SHARED_SECRET`: Your iOS app's shared secret
 
Usage
-----
The provided Node.js script can be used to validate a users latest in app subscription using their purchase token. 

The full purchase receipt is saved to the users account at the point of purchase and is returned at the point of login within the `lastpaymenttoken` field.

To validate an Apple subscription, we make a `POST` request to this url:

`https://sandbox.itunes.apple.com/verifyReceipt`

Passing in a request body:

`
{
    "receipt-data": fullReceipt.transactionReceipt,
    password: process.env.IOS_SHARED_SECRET,
}
`

-   The values included in the request body are as follows:
    - `transactionReceipt`: This is the token for the most recent subscription purchase, this comes from the `lastpaymenttoken` retrieved from the user login.
    - `process.env.IOS_SHARED_SECRET`: Your iOS app's shared secret.
      
Verifying an Apple subscriptions validity
-----

To validate an Apple subscription, we should first ensure that the subscription we are trying to validate is an Apple subscription, this can be done by checking the payment platform specified on the Subscription record in Joomla.

We then need `transactionReceipt` from the `lastpaymenttoken`, which will need to be parsed first as its stored as a stringified json object, if either of these attributes are unavailable, we should not attempt to validate the subscription. (This may be the case for some legacy accounts which will need to be ported over manually.)

-   When checking if a subscription is valid, we can use three values returned within the data object when making a `POST` request to the url above:
    - `mostRecentPurchase.expires_date_ms`: The expiry time of the most recent subscription, in ms (milliseconds).
    - `pending_renewal_info[0].auto_renew_status`: If the subscription is set to auto renew. This will be a boolean value.
    - `pending_renewal_info[0].expiration_intent`: This value will represent the reasoning behind the user cancelling their subscription, a data map has been provided within the Node.js script to cover the available reasonings.
 
If the active subscription IS NOT past its expiry time, IS marked as auto renewing and DOES NOT have a `pending_renewal_info[0].expiration_intent` attribute, we can consider this subscription valid.

If the active subscription IS NOT past its expiry, but ISN'T marked as auto renewing and has a `pending_renewal_info[0].expiration_intent`, the subscription should remain active BUT should be marked as cancelled in Joomla, this will then restrict access at the end of the billing period. 

The Node.js script logs an `isValid` calculation to the console factoring in the scenario described above.

JWT to Bearer Conversion
=======================

This is a Node.js script that converts a JKF (JSON Key File) into a JSON Web Token (JWT) into a Bearer token by making a request to the Google OAuth 2.0 API.

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

    ```
        SERVICE_ACCOUNT_EMAIL=your-service-account-email@example.com
        PRIVATE_KEY=your-service-account-private-key
        CLAIM_SET_SCOPE=desired-scope
    ```

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
