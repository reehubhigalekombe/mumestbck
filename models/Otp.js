const mongoose = require("mongoose");

const otpSchema = new mongoose. Schema({
    email: { 
        type: String,
        required: true,
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        time: Date,
    }
})

module.exports = mongoose.model("Otp", otpSchema)