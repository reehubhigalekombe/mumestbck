
const express = require("express")
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User")
const {authenticateToken} = require("../middleware/authMiddleware")

router.post("/signup", async (req, res) => {
    try {
        const {
            firstName, 
            middleName, 
            lastName, 
            nationalId,
            email, 
            phoneNumber,
            password,
        } = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "User Allready Exists"});

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName, 
            middleName, 
            lastName, 
            nationalId,
            email, 
            phoneNumber,
            password: hashedPassword
        })
        await newUser.save();
        res.status(201).json({message: "User signed in Successfully"})
    } catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error"})
    }
} );

router.post("/login", async (req, res) => {
    try {
        const{email, password, rememberMe} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"})

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return res.status(400).json({message: "Invalid Credentials"});

            const expiresIn = rememberMe ? "2d" : "2h"

            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn})
            res.status(200).json({message: "Login Succesful", token})
    }catch(err) {
        console.error(err);
        res.status(400).json({message: "Server Error"})
    }
})

router.post("/logout", authenticateToken, (req, res) => {
    const user = req.user;

    console.log(`User ${user.email} logged out at ${new Date().toISOString()} `);
    res.status(200).json({message: "Logout Successful"})
} )

module.exports = router