const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");


router.post("/",  async (req, res) => {
    try {
        const{fullName, email, phoneNumber, subject, textarea} = req.body;
        const newFeedback= new Feedback.find({
            fullName,
            email,
            phoneNumber,
            subject,
            textarea
        })
        await newFeedback.save();
        res.status(201).json({message: "Received Succesfully"})
    }catch(error) {
        console.error("failed to recive the message")
        res.status(500).json({message: "Server error, failed to recieve the message"})
    }

})

module.exports = router
