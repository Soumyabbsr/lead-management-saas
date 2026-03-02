require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function dumpUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const users = await User.find({}).select('+password');
        console.log(`Found ${users.length} total users.`);

        for (const u of users) {
            console.log(`User ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | TenantID: ${u.tenantId}`);
            console.log(`Password Hash: ${u.password.substring(0, 20)}...`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Script Error:", error);
        process.exit(1);
    }
}

dumpUsers();
