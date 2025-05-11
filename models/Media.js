const mongoose = require("mongoose")

const mediaSchema = new mongoose.Schema ({
    type: {
        type: String, 
        enum: ["image",  "video"],
        required: true
    },
    path: {
        type: String,
        required: true
    },
    title: {
        type: String
    }
})

module.exports = mongoose.model("Media", mediaSchema)