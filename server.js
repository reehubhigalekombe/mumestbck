require("dotenv").config()
const express = require("express")
const connectDB = require("./db")
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const mediaRoutes = require("./routes/media");

const app = express();

connectDB()

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:3000",
    Credential: true,
}
))

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use(mediaRoutes)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.get("/", (req, res) => {
    res.send({message: "Hello Higal the Backend Server is connected"})
})

app.listen(PORT, () => {
    console.log(`Server is connected Successfully ${PORT}`)
})