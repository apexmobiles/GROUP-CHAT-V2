const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

const messages = [];

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("join", (username) => {
        socket.username = username;

        io.emit("system", `${username} joined the group`);

        socket.emit("history", messages);
    });

    socket.on("message", (text) => {
        if (!socket.username || !text.trim()) return;

        const message = {
            username: socket.username,
            text: text.trim(),
            time: new Date().toLocaleTimeString()
        };

        messages.push(message);

        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        if (socket.username) {
            io.emit("system", `${socket.username} left the group`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Group chat running on port ${PORT}`);
});
