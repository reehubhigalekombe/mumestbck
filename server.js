require("dotenv").config()
const express = require("express")
const connectDB = require("./db")
const cors = require("cors");
const authRoutes = require("./routes/auth");
const path = require("path");
const bodyParser = require("body-parser");
const mpesaRoutes = require("./routes/mympesa")


const app = express();

connectDB()

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "https://higalekombemes.onrender.com",
    credentials: true,
}
))
app.use(express.json());
app.use(bodyParser.json())



app.use("/api/auth", authRoutes);
app.use("/api/mympesa", mpesaRoutes)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))
app.get("/", (req, res) => {
    res.send({message: "Hello Higal the Backend Server is connected"})
})

app.listen(PORT, () => {
    console.log(`Server is connected Successfully ${PORT}`)
})
