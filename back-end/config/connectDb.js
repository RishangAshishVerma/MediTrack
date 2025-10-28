// File: config/db.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    
    await mongoose.connect(process.env.MONGODB)
    console.log("Database connected successfully!");

  } catch (error) {
    console.error(`Error while connecting to the database ${error}`);
    process.exit(1); 
  }
};

export default connectDb;
