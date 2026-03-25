const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected");

    setInterval(async ()=>{
      try{
        await mongoose.connection.db.admin().ping();
        console.log("MongoDB pinged");
      }catch(e){
        console.error("Ping failed");
      }
    },1000*60*60*24);

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
