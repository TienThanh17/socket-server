const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


let onlineUsers = [];

const addNewUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addNewUser(userId, socket.id);
    console.log(userId, socket.id);
  });

  socket.on("sendNotification", ({ senderId, receiverId, type, ride }) => {
    console.log('sendNotification', senderId, type);
    const receiver = getUser(receiverId);
    if(receiver) {
      io.to(receiver.socketId).emit("getNotification", {
        senderId,
        type,
        ride: ride ?? null
      });
    }
  });

  socket.on("sendText", ({ senderId, receiverId, text }) => {
    const receiver = getUser(receiverId);
    io.to(receiver.socketId).emit("getText", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

server.listen(3001, () => {
  console.log('listening on port 3001');
});
