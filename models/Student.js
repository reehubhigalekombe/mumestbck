const mongoose =  require("mongoose");

const StudentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    nationalId: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    postalAddress: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    accountName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model("Student", StudentSchema )
 