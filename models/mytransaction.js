const mongoose = require("mongoose")

const mytransaction = new mongoose.Schema({
    checkoutRequestId: {
        type: String,
        required: true,
    },
    merchantRequestId: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
    },
    resultDesc: {
        type: String,
    },
    rawCallback: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

})

module.exports = mongoose.model("Mytransaction", mytransaction)