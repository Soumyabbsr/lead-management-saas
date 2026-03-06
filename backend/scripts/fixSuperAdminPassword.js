/**
 * Run this script to verify and optionally reset the super admin password.
 * 
 * Usage:
 *   Verify only:   node backend/scripts/fixSuperAdminPassword.js
 *   Reset:         node backend/scripts/fixSuperAdminPassword.js reset MyNewPass123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...\n');

        // Find super admin
        const superAdmin = await User.findOne({ role: 'super_admin' }).select('+password');

        if (!superAdmin) {
            console.log('❌ No super_admin user found in the database.');
            console.log('   Run: node backend/scripts/seedSuperAdmin.js');
            process.exit(1);
        }

        console.log('✅ Super Admin found:');
        console.log(`   Name:   ${superAdmin.name}`);
        console.log(`   Email:  ${superAdmin.email}`);
        console.log(`   Status: ${superAdmin.status}`);
        console.log(`   Role:   ${superAdmin.role}`);
        console.log('');

        // Check if user wants to reset
        const action = process.argv[2];
        const newPassword = process.argv[3];

        if (action === 'reset' && newPassword) {
            superAdmin.password = newPassword;
            await superAdmin.save(); // pre-save hook will hash it
            console.log(`🔑 Password reset to: "${newPassword}"`);
            console.log('   You can now login with this password.');
        } else {
            // Try some common passwords
            const commonPasswords = ['password123', 'admin123', 'Admin@123', 'Welcome@123', 'super123'];
            console.log('Testing common passwords...');
            let matched = false;
            for (const pwd of commonPasswords) {
                const result = await superAdmin.matchPassword(pwd);
                if (result) {
                    console.log(`✅ Password matches: "${pwd}"`);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                console.log('❌ None of the common passwords matched.');
                console.log('');
                console.log('To reset, run:');
                console.log('   node backend/scripts/fixSuperAdminPassword.js reset YourNewPassword');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

run();
