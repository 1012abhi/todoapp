import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default connectDB;