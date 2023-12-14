//docs for validating google receipt can be found here: https://adapty.io/blog/android-in-app-purchases-server-side-validation/

require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");

const { jwtToBearer } = require("./jwt");

const cancellationReasons = {
    0: "The user canceled the subscription auto-renewal.",
    1: "Subscription was canceled by the system. This is most often caused by a billing issue. ",
    2: "The user switched to a different subscription plan. ",
    3: "The developer canceled the subscription.",
};

async function validateGoogleReceipt(isSub) {
    try {
        const type = isSub ? "subscriptions" : "products";

        const accessTokenInfo = await jwtToBearer();

        const formData = new FormData();

        formData.append("action", "login");
        formData.append("username", "charlespalmerbf@gmail.com");
        formData.append("password", `${process.env.TTP_USER_PASSWORD}`);

        const userInfo = await axios.post(`${process.env.API_BASE}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const fullReceipt = await JSON.parse(userInfo.data.lastpaymenttoken);

        const url =
            "https://androidpublisher.googleapis.com/androidpublisher/v3/applications" +
            `/${process.env.ANDROID_BUNDLE_ID}/purchases/${type}/${fullReceipt.productId}` +
            `/tokens/${fullReceipt.purchaseToken}?access_token=${accessTokenInfo.access_token}`;

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

        // ----- log most recent purchase. -----
        console.debug(data);

        const isValid = Boolean(
            data.autoRenewing ||
                Number(Date.now()) < Number(data.expiryTimeMillis)
        );

        // ----- log the subscriptions cancel reason, if it exists. -----
        data.hasOwnProperty("cancelReason") &&
            console.debug(
                `Cancellation Reason: ${
                    cancellationReasons[Number(data.cancelReason)]
                }`
            );

        // ----- log the subscriptions auto renewal status. -----
        console.debug(`Auto Renewing: ${Boolean(data.autoRenewing)}`);

        // ----- log if the subscription is valid. -----
        console.debug(`Is Valid: ${isValid}`);
    } catch (error) {
        console.error(error);
    }
}

validateGoogleReceipt(true);
