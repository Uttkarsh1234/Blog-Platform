const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Students");

const EmployeeSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
})


module.exports = mongoose.model("User",EmployeeSchema);