const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comment: String,
  date_time: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
});

const PhotoSchema = new mongoose.Schema({
  file_name: { type: String },
  date_time: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.ObjectId,
  comments: [CommentSchema],
});

const Photo = mongoose.model("Photo", PhotoSchema, "photos");

module.exports = Photo;
