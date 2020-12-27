const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    //refernce with user
    type: mongoose.Schema.Types.ObjectId, //connect with user id
    ref: "User",
  },
  name: {
    type: String,
  },
  total_hours: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error("hRS should not be negative");
      }
    },
    //   enum: ["8", "10", "6"],//we used enum for specific filed to added
  },
  working_hours: [
    {
      hours: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Profile", ProfileSchema);
