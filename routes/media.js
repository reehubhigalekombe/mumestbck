const router = express.Router();
const express = require("express");
const mongoose = require("mongoose");
const Media = require("../models/Media")

router.get("/api/media", async (req, res) => {
    try {
        const media = await Media.find();
        res.json(media);
    }catch(error) {
        res.status(500).json({error: "Media fetch failed"})
    }
})

module.exports = router;