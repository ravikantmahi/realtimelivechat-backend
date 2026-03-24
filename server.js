const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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