
import { Server } from "socket.io";
import { saveMessage } from "../services/chat.service.js";

const initializeSocketConnection = (httpServer)=>{
    let io = new Server(httpServer, {
        cors : {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });
    
    io.on("connection",(socket)=>{
        console.log("Client connected", socket.id);

        socket.on("joinChat",({current, target})=>{
            let room = [current,target].sort().join("_");

            console.log("joined ", room);
            socket.join(room);

        });

        socket.on("sendMessage",async({current,target,text})=>{
            let room = [current,target].sort().join("_");

            let chat = await saveMessage(current,target,text)

            io.to(room).emit("receiveMessage",{current,target,text})
        });

        socket.on("disconnect",()=>{
            console.log("disconnected");
        });
    });
}

export default initializeSocketConnection;