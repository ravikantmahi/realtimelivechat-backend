const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Chat Backend is running successfully!');
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://realtimelivechat.vercel.app", 
        methods: ["GET", "POST"]
    }
});

// Track online users
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // When a user joins, add them to the list and broadcast the new list
    socket.on("user_joined", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("active_users", Object.values(onlineUsers));
    });

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
    });

    socket.on("typing", (data) => {
        socket.broadcast.emit("display_typing", data);
    });

    socket.on("stop_typing", () => {
        socket.broadcast.emit("clear_typing");
    });

    // When a user leaves, remove them and update everyone else
    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
        delete onlineUsers[socket.id];
        io.emit("active_users", Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
