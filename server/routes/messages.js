const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET /api/messages/:room?page=1&limit=30
// REST fallback — used on reconnect to fetch missed messages
router.get("/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ room });

    res.json({
      messages: messages.reverse(), // oldest first
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// DELETE /api/messages/:room  (optional: clear room history)
router.delete("/:room", async (req, res) => {
  try {
    await Message.deleteMany({ room: req.params.room });
    res.json({ message: "Room history cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear messages" });
  }
});

module.exports = router;
