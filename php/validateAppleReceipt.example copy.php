<?php
// Load .env file if necessary
// require 'vendor/autoload.php'; // Load dotenv library if necessary
// Dotenv\Dotenv::createImmutable(__DIR__)->load(); // Load .env file if necessary

function validateAppleReceipt($receiptData) {
    $receiptData = json_encode(array(
        'receipt-data' => $receiptData,
        'password' => getenv('IOS_SHARED_SECRET') // Fetch IOS_SHARED_SECRET from environment
    ));

    $ch = curl_init('https://sandbox.itunes.apple.com/verifyReceipt');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $receiptData);

    $response = curl_exec($ch);
    if ($response === false) {
        echo 'Curl error: ' . curl_error($ch);
    } else {
        $decodedResponse = json_decode($response, true);

        if ($decodedResponse['status'] === 0) {
            $latestReceiptInfo = $decodedResponse['latest_receipt_info'];
            $pendingRenewalInfo = $decodedResponse['pending_renewal_info'];

            $filteredObject = null;
            foreach ($latestReceiptInfo as $item) {
                if ($item['original_transaction_id'] === $pendingRenewalInfo[0]['original_transaction_id']) {
                    $filteredObject = $item;
                    break;
                }
            }

            if ($filteredObject !== null) {
                echo '<pre>';
                print_r($filteredObject);
                echo '</pre>';

                $isValid = (time() < ($filteredObject['expires_date_ms'] / 1000));
                echo 'isValid: ' . ($isValid ? 'true' : 'false');
            }
        } else {
            echo 'Receipt is invalid: ';
            echo '<pre>';
            print_r($decodedResponse);
            echo '</pre>';
        }
    }

    curl_close($ch);
}

// Usage
validateAppleReceipt("YOUR_RECEIPT_DATA_HERE");
?>
