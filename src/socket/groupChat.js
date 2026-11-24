
let onlineUsers = new Map();

export const initializeGroupChat = (io,socket)=>{

    socket.on("group-chat", ({ groupId }) => {

        socket.join(`group_${groupId}`);
        console.log(`User joined group: ${groupId}`);

    });
}