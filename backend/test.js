import mongoose from "mongoose";

const uri = "mongodb+srv://lifeosUser:neP7Bdupw4YnZJTB@cluster0.hd0q2wz.mongodb.net/lifeos";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected!"))
    .catch(err => console.error("Error:", err));