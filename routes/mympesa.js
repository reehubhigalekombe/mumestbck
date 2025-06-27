const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

 const getToken = async () => {
    const url =  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");
    const{data} = await axios.get(url, {
        headers: {
            Authorization: `Basic ${auth}`
        }
    });
    return data.access_token
 }


 router.post("/stkpush", async (req, res) => {
    try {
        const token = await getToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)
        const password = Buffer.from(
            `${process.env.MPESA_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString("base64");
        const {amount, phone} = req.body;
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: process.env.MPESA_SHORT_CODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: process.env.MPESA_SHORT_CODE,
                PhoneNumber: phone,
                CallBackURL: process.env.MPESA_CALLBACK_URL, 
                AccountReference: "Tution",
                TransactionDesc: "Payment of Fuel Levy"
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ); 
        res.status(200).json({
            message: "STK push has been initiated", data: response.data
        });

    }catch(error) {
        console.error("STK push error", error.response?.data || error.message);
        res.status(500).json({error: "STK Push failed"})
    }
 });


router.post("/callback", async (req, res) => {
    console.log("Recieved a safaricom callback");
    console.log(JSON.stringify(req.body, null, 2));
    res.status(200).json({message: "Callback recieved"})
})

module.exports = router;