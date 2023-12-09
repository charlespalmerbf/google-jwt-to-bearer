<?php

function jwtToBearer() {
    // Implement the logic for jwtToBearer function here in PHP
    // Return the access token or handle the token retrieval accordingly
}

function validateGoogleReceipt($productId, $productToken, $isSub) {
    try {
        $type = $isSub ? "subscriptions" : "products";

        // Implement logic to fetch access token using jwtToBearer function
        $accessTokenInfo = jwtToBearer(); // Assuming jwtToBearer function is implemented and returns access token info

        $url = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/" . getenv('ANDROID_BUNDLE_ID') . "/purchases/" . $type . "/" . $productId . "/tokens/" . $productToken . "?access_token=" . $accessTokenInfo['access_token'];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200) {
            echo "Request Failed - Code: " . $httpCode . " | Message: " . $response;
        }

        $data = json_decode($response, true);

        print_r($data);

        $isValid = (bool)($data['autoRenewing'] || (time() < ($data['expiryTimeMillis'] / 1000)));

        echo "isValid: " . var_export($isValid, true);
    } catch (Exception $error) {
        echo $error;
    }
}

validateGoogleReceipt(
    "rniapt_900_3m",
    "cedpakmaigfjjanckbfmhefb.AO-J1OzeqV29JmLMCWsBgQpDeOUNpoOg5PoRw2cmJgxKrOXZoBsOedK4HJE_0eFaT98-IGJ1GQxVmjZCmys9CY3_3GkJhxbFypvhGrgUJuipEB9rHH4y4EM",
    true
);
?>
