require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully.');

        // Find the super admin
        const adminUser = await User.findOne({ role: 'super_admin' });

        if (!adminUser) {
            console.log('No super_admin found! Please run node scripts/seedSuperAdmin.js first to create one.');
            process.exit(1);
        }

        console.log(`Found super admin currently saved as: ${adminUser.email}`);

        // Force lowercase and trim
        adminUser.email = adminUser.email.toLowerCase().trim();

        // Overwrite the password so the pre('save') hook encrypts it with bcrypt
        adminUser.password = 'password123';

        // Save triggers the bcrypt hashing
        await adminUser.save();

        console.log(`SUCCESS! Super admin updated. You can now login with:`);
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: password123`);
        process.exit(0);

    } catch (error) {
        console.error('Error fixing super admin:', error);
        process.exit(1);
    }
}

fixAdmin();
