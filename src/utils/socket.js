
import { Server } from "socket.io";
import { editMessageService, saveMessage } from "../helpers/chat.helper.js";
import { handleAddorEditMessage } from "../helpers/message.helper.js";

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

        socket.on("typing:start", ({ current, target }) => {
            const room = [current, target].sort().join("_");
            socket.to(room).emit("typing:start", {
                userId: current
            });
        });

        socket.on("typing:stop", ({ current, target }) => {
            const room = [current, target].sort().join("_");
            socket.to(room).emit("typing:stop", {
                userId: current
            });
        });

        socket.on("sendMessage",async(data, callback)=>{

            try {
                // console.log("data in socket ************ ", data);

                let {current, target, text, type , file} = data;
                let room = [current,target].sort().join("_"); 

                const result = await handleAddorEditMessage({
                    senderId: current,
                    receiverId: target,
                    text: text,
                    type: type,
                    file: file,
                });

                io.to(room).emit("receiveMessage", result.message) // in front end, called refetching method
                if (typeof callback === "function") {
                    callback({ success: true, message: result.message });
                }
            } catch (error) {
                console.error("Socket error:", error.message);
                if (typeof callback === "function") {
                    callback({ success: false, error: error.message });
                }
            }
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