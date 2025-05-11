const  mongoose = require("mongoose");
const Media = require("../models/Media");
const fs = require("fs");
const path = require("path");

mongoose.connect("mongodb://127.0.0.1:27017/ekombe")

const uploadsDir  = path.join(__dirname, "../public/uploads");

fs.readdir(uploadsDir, async (err, files) => {
    if(err) throw err;

    for(const file of files) {
        const ext = path.extname(file).toLowerCase();
        const mediaType = [".jpeg", ".jpg", ".png", ".webp", ".gif"].includes(ext)
        ?  "image"
        : [".mp4", ".mov", ".avi"].includes(ext)
        ?  "video"
        : null
        if(mediaType){
            const exists = await Media.findOne({path: `/uploads/${file}`})
            if(!exists) {
                const media = new Media({
                    type: mediaType,
                    path: `/uploads/${file}`, 
                    title: file,
                });
                await media.save();
                console.log(`Saved: ${file}`)
            }
        }
    }
    mongoose.connection.close()
});

