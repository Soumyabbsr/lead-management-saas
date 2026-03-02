/**
 * ONE-TIME DATABASE RESET SCRIPT
 * Clears all sample/test data from MongoDB.
 * Keeps ONE admin user so you can still log in.
 *
 * Run with: node backend/scripts/clearDatabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function clearDatabase() {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
        const name = col.name;

        if (name === 'users') {
            // Keep Admin users, remove all non-Admin / sample users
            const result = await db.collection('users').deleteMany({ role: { $ne: 'Admin' } });
            console.log(`🗑  users → deleted ${result.deletedCount} non-Admin users (kept all Admins)`);
        } else {
            // Wipe everything else: leads, activities, bookings, visits, settings
            const result = await db.collection(name).deleteMany({});
            console.log(`🗑  ${name} → deleted ${result.deletedCount} documents`);
        }
    }

    console.log('\n✅ Database cleared. All sample data removed.');
    console.log('   Your Admin account(s) are preserved — log in to start fresh.');
    await mongoose.disconnect();
    process.exit(0);
}

clearDatabase().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
