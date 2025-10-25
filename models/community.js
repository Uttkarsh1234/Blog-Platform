const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Students");

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    profilePic: { type: String, default: "/images/default-avatar.png" },
    bio: { type: String, default: "" },
    interests: [String],
    isCommunityMember: { type: Boolean, default: false }
})
module.exports = mongoose.model("community-model",userSchema);