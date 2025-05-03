const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router()
const User = require("../models/User");

router.post("/signup", async (req, res) => {
    const {username, email, password} = req.body;
    try {

        const existingUser = await User.findOne({email});
        if(existingUser)
            return res.status(400).json({message: "The user with email adress provided allready exists"})
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({username, email, password:hashedPassword})
        await newUser.save();
        res.status(200).json({message: "User Signed Up Succesfully"})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
});

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email})
        if(!user) 
            return res.status(400).json({message: "Invalid user email/password"})

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({message: "Invalid user email/password"});

        }
           
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "2h"
        });
        res.json({token, user: {id: user._id, username: user.username,
            email: user.email, 
        }});

    }catch(err) {
        res.status(500).json({message: err.message})
    }
})

module.exports = router

