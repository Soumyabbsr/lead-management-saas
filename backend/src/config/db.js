const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        console.log('Using cached MongoDB connection');
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log("Mongo Connected DB:", conn.connection.name); // ← THIS LINE
        return cachedConnection;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
