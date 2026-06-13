const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      trim: true,
      index: true, // compound index for fast room queries
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// Compound index: fast pagination by room + time
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
