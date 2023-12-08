require("dotenv").config();

const axios = require("axios");

const { jwtToBearer } = require("./jwt");

async function validateGoogleReceipt(productId, productToken, isSub) {
    try {
        const type = isSub ? "subscriptions" : "products";

        const accessTokenInfo = await jwtToBearer();

        const url =
            "https://androidpublisher.googleapis.com/androidpublisher/v3/applications" +
            `/${process.env.ANDROID_BUNDLE_ID}/purchases/${type}/${productId}` +
            `/tokens/${productToken}?access_token=${accessTokenInfo.access_token}`;

        const { data, status, statusText } = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (status !== 200) {
            console.debug(
                "Request Failed - Code: " + status + " | Message: " + statusText
            );
        }

        console.debug(data);

        const isValid = Boolean(
            data.autoRenewing ||
                Number(Date.now()) < Number(data.expiryTimeMillis)
        );

        console.debug(`isValid: ${isValid}`);
    } catch (error) {
        console.error(error);
    }
}

validateGoogleReceipt(
    "rniapt_900_3m",
    "cedpakmaigfjjanckbfmhefb.AO-J1OzeqV29JmLMCWsBgQpDeOUNpoOg5PoRw2cmJgxKrOXZoBsOedK4HJE_0eFaT98-IGJ1GQxVmjZCmys9CY3_3GkJhxbFypvhGrgUJuipEB9rHH4y4EM",
    true
);
