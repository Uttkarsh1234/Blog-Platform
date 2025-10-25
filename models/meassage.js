const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Students");

const ContactSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true },
  message:     { type: String, required: true, trim: true },
  createdAt:   { type: Date, default: Date.now },
  ip:          { type: String } // optional: store submitter IP
});

module.exports = mongoose.model('ContactMessage', ContactSchema);
