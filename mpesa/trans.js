const axios = require("axios");
require("dotenv").config();

exports.getToken = async () => {
    const url  = "https://sandbox.safaricom.co.ke/otrans/v1/generate?grant_type=client_credentials";

    const trans = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
const{data} = await axios.get(url, {
    headers: {
        Authorization: `Basic ${trans}`,
    },
});
return data.access_token;
}
