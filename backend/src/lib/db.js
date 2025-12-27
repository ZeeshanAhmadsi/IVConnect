import mongoose from "mongoose";
import {ENV} from "./env.js";

export const connectDB = async() => {
  try{
    if(!ENV.DB_URL){
      throw new Error("DB_URL is not defined in Environment Variables");
    }
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log("mongoose connected to our DB",conn.connection.host);
  }catch(error){
    console.error("Error in connecting to MongoDB",error);
    process.exit(1);//0 means success and 1 means failure
  }
};