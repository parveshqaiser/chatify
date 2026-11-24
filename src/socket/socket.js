
import { Server } from "socket.io";
import { handleAddMessage, handleEditMesage } from "../helpers/message.helper.js"; // for 1-1 users
import { initializeGroupChat } from "./groupChat.js";

let onlineUsers = new Map();

const initializeSocketConnection = (httpServer)=>{
    let io = new Server(httpServer, {
        cors : {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });
    
    io.on("connection",(socket)=>{

        // user defined-event at the time of joining the app
        socket.on("register",(userId)=>{
            onlineUsers.set(userId, socket.id);

            // notify all clients when user logs in & frontend
            io.emit("onlineUsers", [...onlineUsers.keys()]);
        });

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

                let {current, target, text, type , file, messageId, isEdit} = data;
                // console.log("data in socket ************ ", data);
                let room = [current,target].sort().join("_"); 
                // console.log(room, "rommmm");

                let result;

                if(isEdit){
                    result=  handleEditMesage({
                        senderId: current,
                        receiverId: target,
                        text,
                        messageId
                    })
                }else{
                    result = await handleAddMessage({
                        senderId: current,
                        receiverId: target,
                        text: text,
                        type: type,
                        file: file,
                    });
                }
               
                io.to(room).emit("receiveMessage") // in front end, called refetching method
                if (typeof callback === "function") {
                    callback({ success: true, message: result.message });
                }
            } catch (error) {
                console.error("Socket error:", error);
                if (typeof callback === "function") {
                    callback({ success: false, error: error.message });
                }
            }
        });

        initializeGroupChat(io, socket);

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