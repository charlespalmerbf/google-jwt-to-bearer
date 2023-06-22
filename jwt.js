require("dotenv").config();
const https = require("https");

function toBase64URL(json) {
    const jsonString = JSON.stringify(json);
    const btyeArray = Buffer.from(jsonString);
    return btyeArray
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

function getOAuthToken(jwt) {
    return new Promise((resolve, reject) => {
        // request option
        var option = {
            hostname: "oauth2.googleapis.com",
            path: `/token?grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
            method: "POST",
            port: 443,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
        
        var req = https.request(option, function (res) {
            var result = "";
            res.on("data", function (chunk) {
                result += chunk;
            });
            res.on("end", function () {
                resolve(result);
            });
        });

        req.on("error", function (err) {
            reject(err);
        });

        req.end();
    });
}

async function jwtToBearer(){
    const result = await getOAuthToken(jwt).catch(err => { console.log(err)});
    const json = JSON.parse(result);
    console.log(json);
}

const header = {
    alg: "RS256",
    typ: "JWT",
};

const now = new Date().getTime() / 1000;
const oneHour = 60 * 60;
const expireTime = now + oneHour;
const claimSet = {
    iss: process.env.SERVICE_ACCOUNT_EMAIL,
    iat: now,
    exp: expireTime,
    scope: process.env.CLAIM_SET_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
};

const encodedHeader = toBase64URL(header);
const encodedClaimSet = toBase64URL(claimSet);

const crypto = require("crypto");

const signer = crypto.createSign("RSA-SHA256");

signer.write(encodedHeader + "." + encodedClaimSet);
signer.end;

const signature = signer.sign(process.env.PRIVATE_KEY, "base64");

const encodedSignature = signature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

const jwt = `${encodedHeader}.${encodedClaimSet}.${encodedSignature}`;

jwtToBearer();
