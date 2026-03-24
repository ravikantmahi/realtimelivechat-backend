const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// 1. THIS FIXES THE "Cannot GET /" ERROR ON RENDER
app.get('/', (req, res) => {
    res.send('Chat Backend is running successfully!');
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // 2. THIS ALLOWS YOUR VERCEL APP TO CONNECT
        // Replace this exact string with your live Vercel URL (No slash at the end!)
        origin: "https://realtimelivechat.vercel.app", 
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Broadcast messages to everyone else
    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
    });

    // Broadcast that a user is typing
    socket.on("typing", (data) => {
        socket.broadcast.emit("display_typing", data);
    });

    // Broadcast that a user stopped typing
    socket.on("stop_typing", () => {
        socket.broadcast.emit("clear_typing");
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
