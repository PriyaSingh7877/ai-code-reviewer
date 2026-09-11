const mongoose = require('mongoose')

  const connectDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch(error){
    console.error(`Error connection to MongoDB: ${error.massage}`);
    process.exit(1); // server stop when database fail
  };
  
  };

  module.exports = connectDB;
