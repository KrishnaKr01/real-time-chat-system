const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const messageRoutes = require("./routes/messages");
const roomRoutes = require("./routes/rooms");
const Message = require("./models/Message");
const Room = require("./models/Room");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// REST API Routes (fallback for message history on reconnect)
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);

// Track online users per room: { roomName: Set<socketId> }
const roomUsers = {};

// ── Socket.io ──────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // Join a room
  socket.on("join_room", async ({ room, username }) => {
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;

    // Track presence
    if (!roomUsers[room]) roomUsers[room] = new Set();
    roomUsers[room].add(socket.id);

    // Ensure room exists in DB
    await Room.findOneAndUpdate(
      { name: room },
      { name: room },
      { upsert: true, new: true }
    );

    // Broadcast presence update
    io.to(room).emit("user_presence", {
      users: roomUsers[room].size,
      message: `${username} joined the room`,
    });

    console.log(`👤 ${username} joined room: ${room}`);
  });

  // Send message
  socket.on("send_message", async ({ room, username, message }) => {
    try {
      // Persist to MongoDB
      const newMsg = await Message.create({ room, username, message });

      // Broadcast to room
      io.to(room).emit("receive_message", {
        _id: newMsg._id,
        room,
        username,
        message,
        createdAt: newMsg.createdAt,
      });
    } catch (err) {
      console.error("Message save error:", err.message);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("user_typing", { username });
  });

  socket.on("stop_typing", ({ room }) => {
    socket.to(room).emit("user_stop_typing");
  });

  // Disconnect
  socket.on("disconnect", () => {
    const { username, room } = socket.data;
    if (room && roomUsers[room]) {
      roomUsers[room].delete(socket.id);
      io.to(room).emit("user_presence", {
        users: roomUsers[room].size,
        message: `${username} left the room`,
      });
    }
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// ── MongoDB + Start Server ─────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));
