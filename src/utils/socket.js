
import { Server } from "socket.io";

const initializeSocketConnection = (httpServer)=>{
    let io = new Server(httpServer, {
        cors : {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });
    
    io.on("connection",(socket)=>{
        // handle events


        socket.on("joinChat",({current, target})=>{
            let room = [current,target].join("-");

            console.log("joined ", room);
            socket.join(room);

        });

        socket.on("sendMessage",({current, target,text})=>{
            let room = [current,target].join("-");

        
        });

        socket.on("disconnect",()=>{
            
        });
    });
}

export default initializeSocketConnection;