require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function testPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const user = await User.findOne({ role: 'admin' }).sort({ createdAt: -1 }).select('+password');
        if (!user) {
            console.log("No super_admin/admin users found.");
            process.exit(0);
        }

        console.log("LATEST USER:", user.name);
        console.log("EMAIL:", user.email);
        console.log("HASH:", user.password);
        console.log("ROLE:", user.role);

        const testPasswords = ['password123', 'Skyline2024', 'Welcome@123'];
        for (const pw of testPasswords) {
            console.log(`MATCH ("${pw}"):`, await user.matchPassword(pw));
        }

        process.exit(0);
    } catch (error) {
        console.error("Script Error:", error);
        process.exit(1);
    }
}

testPassword();
