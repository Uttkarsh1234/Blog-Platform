const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visibility: {
        type: String,
        enum: ['public','private'],
        default: 'private'
    }
});


module.exports = mongoose.model("User",EmployeeSchema);