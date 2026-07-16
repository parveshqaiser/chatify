
import "dotenv/config";

import express, { urlencoded } from "express";
import cors from "cors";
import http from "node:http";
import dbConnection from "./config/db.js";
import cookieParser from "cookie-parser";
import initializeSocketConnection from "./utils/socket.js";
import authRoutes from "./routes/auth.routes.js"; 
import chatRoutes from "./routes/chat.routes.js"; 

let app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors({
    origin : "http://localhost:5173/",
    methods : ["GET", "POST", "PUT", "PATCH","DELETE"],
    credentials : true,
    allowedHeaders : ["Content-Type", "Authorization"]
}));


let PORT = 7500 ?? 2500;

let httpServer = http.createServer(app);
initializeSocketConnection(httpServer);

app.get("/", (req, res)=>{
    res.status(200).json({
        message : "Hello Parvesh, server is up running at port no ******",
        success : true
    })
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: "No Such Route found",
        success: false
    });
});


dbConnection().then(()=>{
    console.log("DB connected");

    httpServer.listen(PORT, ()=>{
        console.log(`Server is up at http:localhost:${PORT}`);
    });
}).catch(err =>{
    console.log("Some Error in connecting DB");
    process.exit(1);  
    //if there is error , de establish the connection or exit the connection
})

