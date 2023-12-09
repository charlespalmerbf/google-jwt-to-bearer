<?php

function toBase64URL($json) {
    $jsonString = json_encode($json);
    $byteArray = base64_encode($jsonString);
    return str_replace(["+", "/", "="], ["-", "_", ""], $byteArray);
}

function getOAuthToken($jwt) {
    $postData = http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]);

    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $postData
        ]
    ];

    $context = stream_context_create($opts);
    $result = file_get_contents('https://oauth2.googleapis.com/token', false, $context);

    return $result;
}

function jwtToBearer() {
    global $jwt;
    $result = getOAuthToken($jwt);
    $json = json_decode($result, true);
    echo json_encode($json);
}

$header = [
    "alg" => "RS256",
    "typ" => "JWT"
];

$now = time();
$oneHour = 60 * 60;
$expireTime = $now + $oneHour;
$claimSet = [
    "iss" => $_ENV['SERVICE_ACCOUNT_EMAIL'],
    "iat" => $now,
    "exp" => $expireTime,
    "scope" => $_ENV['CLAIM_SET_SCOPE'],
    "aud" => "https://oauth2.googleapis.com/token"
];

$encodedHeader = toBase64URL($header);
$encodedClaimSet = toBase64URL($claimSet);

$privateKey = $_ENV['PRIVATE_KEY'];

$signature = '';
openssl_sign($encodedHeader . "." . $encodedClaimSet, $signature, $privateKey, OPENSSL_ALGO_SHA256);

$encodedSignature = str_replace(["+", "/", "="], ["-", "_", ""], base64_encode($signature));

$jwt = $encodedHeader . "." . $encodedClaimSet . "." . $encodedSignature;

jwtToBearer();

?>