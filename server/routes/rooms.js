const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// GET /api/rooms — list all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).lean();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// POST /api/rooms — create a new room
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });
    const room = await Room.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

module.exports = router;
