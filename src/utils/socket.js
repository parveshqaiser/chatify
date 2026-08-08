
import { Server } from "socket.io";
import { saveMessage } from "../services/chat.service.js";

let onlineUsers = new Map();

const initializeSocketConnection = (httpServer)=>{
    let io = new Server(httpServer, {
        cors : {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });
    
    io.on("connection",(socket)=>{

        socket.on("register",(userId)=>{
            onlineUsers.set(userId, socket.id);

            // notify all clients
            io.emit("onlineUsers", [...onlineUsers.keys()]);
        })

        socket.on("joinChat",({current, target})=>{
            let room = [current,target].sort().join("_");
            socket.join(room);
        });

        socket.on("sendMessage",async({current,target,text})=>{
            let room = [current,target].sort().join("_");
            let chat = await saveMessage(current,target,text);
            io.to(room).emit("receiveMessage",{current,target,text})
        });

        socket.on("disconnect",()=>{
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit("onlineUsers", [...onlineUsers.keys()]);
        });
    });
}

export default initializeSocketConnection;