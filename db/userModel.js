const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  login_name: { type: String }, 
  password: { type: String } 
});

const User = mongoose.model("User", UserSchema, "users");

module.exports = User;
