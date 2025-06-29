const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();
const Mytransaction = require("../models/mytransaction")

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
        
    const {MerchantRequestID, CheckoutRequestID} = response.data;
    await Mytransaction.create({
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        phone,
        amount,
        status: "Pending"
    });
    res.status(200).json({
        message: "The STK Push has been initiated",
        data: response.data
    })

    }catch(error) {
        console.error("STK push error", error.response?.data || error.message);
        res.status(500).json({error: "STK Push failed"})
    }
 });


router.post("/callback", async (req, res) => {
    const cb = req.body.Body.stkCallback;
    const checkoutRequestId = cb.CheckoutRequestID;
    const resultCode = cb.ResultCode;
    const resultDesc = cb.ResultDesc;

    const items = cb.CallbackMetadata?.Item || [];
    const amount = items.find(i => i.Name === "Amount")?.Value;
    const phone = items.find(i => i.Name === "PhoneNumber")?.Value;

    await Mytransaction.findOneAndUpdate(
        {checkoutRequestId}, 
        {
            status: resultCode === 0 ? "Success" : "Failed",
            resultDesc,
            rawCallback: JSON.stringify(req.body)
        }
    );
    console.log(`Mytransaction ${checkoutRequestId} updated: ${resultDesc}`)
    res.status(200).json({message: "Callback received"})
})

router.get("/status/:checkoutRequestId", async (req, res) => {
    const {checkoutRequestId} = req.params;
    const tx  = await Mytransaction.findOne({checkoutRequestId});
    if (!tx) return res.status(400).json({error: "Transcation not found"})
        res.json({status: tx.status, resultDesc: tx.resultDesc})
})

module.exports = router;