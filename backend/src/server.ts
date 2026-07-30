import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";
import connectDB from "./config/db";



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

// mongoose
// .connect(process.env.MONGO_URI as string)
// .then(() => {
//     // console.log(process.env.MONGO_URI);
//     console.log("MongoDB Connected");

//     app.listen(PORT, () => {
//         console.log(`Server running on ${PORT}`);
//     });
// })
// .catch(err => {
//     console.log(err);
// });