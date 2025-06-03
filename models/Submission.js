const mongoose = require("mongoose")

const SubmissionSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
        email: {
        type: String,
        required: true,

    },
        phoneNumber: {
        type: String,
        required: true,
    
    },
        subject: {
        type: String,
        required: true,
    },
    
        textarea: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Submission", SubmissionSchema)