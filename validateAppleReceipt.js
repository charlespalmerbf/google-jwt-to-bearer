//docs for validating apple receipt can be found here: https://adapty.io/blog/ios-in-app-purchase-server-side-validation/

require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");

const cancellationReasons = {
    1: "The user canceled the subscription themselves.",
    2: "The subscription was canceled because of billing issues.",
    3: "The user didn’t agree to the price increase.",
    4: "The subscription product was unavailable for renewal, e.g. if it had been removed from App Store Connect.",
    5: "An unknown reason.",
};

async function validateAppleReceipt() {
    try {
        const formData = new FormData();

        formData.append("action", "login");
        formData.append("username", "iossubscription@gmail.com");
        formData.append("password", `${process.env.TTP_USER_PASSWORD}`);

        const { data } = await axios.post(`${process.env.API_BASE}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const fullReceipt = JSON.parse(data.lastpaymenttoken);

        const response = await axios.post(
            "https://sandbox.itunes.apple.com/verifyReceipt",
            {
                "receipt-data": fullReceipt.transactionReceipt,
                password: process.env.IOS_SHARED_SECRET,
            }
        );

        if (response.data.status === 0) {
            // ----- destructure verifyReceipt endpoint response into its separate keys. -----
            const { latest_receipt_info, pending_renewal_info } = response.data;

            // ----- log pending renewal info. -----
            console.debug(pending_renewal_info);

            // ----- log latest receipt info. -----
            const filteredObjects = latest_receipt_info.filter((item) => {
                return (
                    item.original_transaction_id ===
                        pending_renewal_info[0].original_transaction_id &&
                    item.product_id === fullReceipt.productId
                );
            });

            const currentDateInMs = new Date().getTime();

            const mostRecentPurchase = filteredObjects.reduce(
                (closest, obj) => {
                    const dateDiff = Math.abs(
                        obj.purchase_date_ms - currentDateInMs
                    );
                    const closestDiff = Math.abs(
                        closest.purchase_date_ms - currentDateInMs
                    );

                    return dateDiff < closestDiff ? obj : closest;
                }
            );

            // ----- log most recent purchase. -----
            console.debug(mostRecentPurchase);

            // ----- log latest receipt info. -----
            const isValid = Boolean(
                Number(Date.now()) <
                    Number(mostRecentPurchase.expires_date_ms) ||
                    Boolean(pending_renewal_info[0].auto_renew_status === "1")
            );

            // ----- log the subscriptions expiration intent, if it exists. -----
            pending_renewal_info[0].expiration_intent &&
                console.debug(
                    `Cancellation Reason: ${
                        cancellationReasons[
                            Number(pending_renewal_info[0].expiration_intent)
                        ]
                    }`
                );

            // ----- log the subscriptions auto renewal status. -----
            console.debug(
                `Auto Renewing: ${Boolean(
                    pending_renewal_info[0].auto_renew_status === "1"
                )}`
            );

            // ----- log if the subscription is valid. -----
            console.debug(`Is Valid: ${isValid}`);
        } else {
            console.debug("Receipt is invalid:", response.data);
        }
    } catch (error) {
        console.error("Error validating receipt:", error);
    }
}

validateAppleReceipt();
