const mongoose = require("mongoose");

 const UserSchema = new mongoose.Schema({
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
    phoneNumber: { 
        type: String,
        unique: true,
        required: true,
    },
    nationalId:  {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
        
    },
}, {timestamps: true})

module.exports = mongoose.model("User", UserSchema)