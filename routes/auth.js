
const express = require("express")
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User")
const {authenticateToken} = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer")
const crypto = require("crypto");
const Student = require("../models/Student")
const Submission = require("../models/Submission");
const Otp = require("../models/Otp");


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
        const{email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found"})

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return res.status(400).json({message: "Invalid Credentials"});

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await Otp.deleteMany({email})
            await Otp.create({email, otpHash, expiresAt});

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.OTP_EMAIL,
                    pass: process.env.OTP_PASS
                }
            });
            const mailOptions = {
                from: process.env.OTP_EMAIL,
                to: email,
                subject: "OTP CODE",
                text: `Your OTP Code is ${otp}. The code will expire in % minutes`
            }
await transporter.sendMail(mailOptions);
res.status(200).json({message: "OTP has been sent to your email. Kindly verify to complete the login"})

          
    }catch(err) {
        console.error(err);
        res.status(400).json({message: "Server Error", error: err.message})
    }
});

router.post("/verifyotp", async (req, res) => {
    const {email, otp, rememberMe} = req.body;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    try {
        const existingOtp  = await Otp.findOne({email});
        if(!existingOtp) {
            return res.status(400).json({message: "OTP has not been found, Kindly request for anotyher one"})
        }
        if(existingOtp.expiresAt < new Date()) {
            await Otp.deleteMany({email});
            return res.status(400).json({message: "Your OTP has expired. Kindly request for new OTP"})
        }
        if(existingOtp.otpHash !== otpHash) {
            return res.status(400).json({message: "Invlaid OTP submitted"})
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({message: "The User not found"})
        }

        const expiresIn = rememberMe ? "2d" : "2h";
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn});
        await Otp.deleteMany({email});
        res.status(200).json({message: " Login Success", token})
    }catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error", error:  err.message})
    }


} )

router.post("/logout", authenticateToken, (req, res) => {
    const user = req.user;

    console.log(`User ${user.email} logged out at ${new Date().toISOString()} `);
    res.status(200).json({message: "Logout Successful"})
} );

router.post("/forgot-password", async (req, res) => {
    const {email} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: "User not found!!"})

            const token  = crypto.randomBytes(20).toString("hex");
            user.resetToken = token;
            user.resetTokenExpiry = Date.now() +1800000;
            await user.save();

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        
            const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
            const mailOptions = {
                to: user.email,
                from: process.env.EMAIL_USER,
                subject: "Password Reset",
                html: `
                <p>You requested a password reset?</p>
                <p>Click <a href="${resetUrl}"  >here</a>to reset your email</p> 
                <p>Hey if you never requested this, ignore the email</p>`
            };

            await transporter.sendMail(mailOptions);
            res.json({message: "Check your gmail inbox or spam  and Click here to reset password"})
    }catch(err) {
        res.status(500).json({message: "Something must have gone wrong"})
    }
} );


router.post("/reset-password/:token", async (req, res) => {
    const {token} = req.params;
    const{password} = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: {
                $gt: Date.now()
            }
        });

        if (!user) return res.status(400).json({message: "Invalid user or your token has expired"});

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined

        await user.save()

        res.json({message: "Password reset was succesful!!"})
    }catch(err) {
        res.status(500).json({message: " failed to reset your password, try again"})
    }
});

router.post("/submission", async (req, res) => {
     const {fullName, email, phoneNumber, subject, textarea} = req.body;
    try {
       
        const newSubmission = new Submission({
            fullName, 
            email, 
            phoneNumber, 
            subject, 
            textarea
        });
        await newSubmission.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        const mailOptions = {
            from: email.user,
            to: process.env.EMAIL_USER,
            text: `
            New message from ${fullName}
            Email: ${email}
            Phone: ${phoneNumber}
            subject: ${subject}
            Message: ${textarea}
           `
        }
        await transporter.sendMail(mailOptions)
        res.status(200).json({message: "Message Send"})
    }catch(err) {
        console.log("Failed to send Message", err)
        res.status(500).json({message: "Server error"})
    }
} );

router.post("/student", async(req, res) => {
    const{ firstName, middleName, lastName, gender, nationalId, phoneNumber, email, postalAddress, postalCode, location,
         bankName, accountName, accountNumber } = req.body;
    try {
    const newStudent = new Student({
          firstName, middleName, lastName, gender,nationalId, phoneNumber, email, postalAddress, 
          postalCode, location, bankName, accountName, accountNumber
    });
    await newStudent.save();
    res.status(200).json({message: 'Form submitted Successfully'})
    }catch(err) {
        console.log("Form submission failed:", err)
        res.status(500).json({message: "Server error"})
    }
})


module.exports = router
 
