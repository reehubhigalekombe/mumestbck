const axios = require("axios");
require("dotenv").config();
const{getToken} =  require("./trans");

exports.stkPush = async (req, res) => {
    try {
        const token  = await getToken();
        const timestamp = new Date(). toISOString().replace(/[^0-9]/g, "").slice(0, 14);
 const password =  Buffer.from(`${process.env.MPESA_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
 const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
{
        BusinessShortCode: process.env.MPESA_SHORT_CODE,
        Password: password,
        Timestamp:  timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: req.body.amount,
        PartyA: req.body.phone,
        PartyB: process.env.MPESA_SHORT_CODE,
        PhoneNumber: req.body.phone,
        CallBackURL:  process.env.MPESA_CALLBACK_URL,
        AccountReference: "YourReference",
        TransactionDesc: "Payment of Tution fees"
},
{
    headers: {
        Authorization: `Bearer ${token}`
    },
}
 );
 res.status(200).json({message: "The STK Push sent Succesfully", data: response.data})
    }catch(error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({error: "Failed to initaite the STK Pushing"})
    }
}