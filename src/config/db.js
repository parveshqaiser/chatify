
import mongoose from "mongoose";

const dbConnection = async()=>{
    await mongoose.connect("mongodb+srv://parveshqaiser:parvesh@cluster0.kv3ztw3.mongodb.net/Chatify");
    // console.log("MongoDB connected:", mongoose.connection.host);
}

export default dbConnection;