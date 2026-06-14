const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: String,
  email: String,
  userId: String
});

module.exports = mongoose.model("Lead", LeadSchema);