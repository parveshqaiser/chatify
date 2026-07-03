
import mongoose from "mongoose";

import "dotenv/config";

const dbConnection = async()=>{
    
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    // console.log("MongoDB connected:", mongoose.connection.host);
}

export default dbConnection;