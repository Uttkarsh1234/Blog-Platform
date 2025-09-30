const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Students");

const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
})

module.exports = mongoose.model("Blog",UserSchema);

