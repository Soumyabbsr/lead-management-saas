require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const Plan = require('../src/models/Plan');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        // Check if a super admin already exists
        const existingAdmin = await User.findOne({ role: 'super_admin' });
        if (existingAdmin) {
            console.log('Super Admin already exists. Exiting...');
            process.exit(0);
        }

        // Create a default Plan for the SAAS owner itself (or bypass plans for SA, but good to have)
        const superAdminPlan = await Plan.create({
            name: 'Pro', // Can just reuse a standard plan
            priceMonthly: 0,
            priceYearly: 0,
            maxEmployees: 9999,
            maxLeads: 999999,
            features: ['All Features'],
            isActive: true,
        });

        // Create the Owner Tenant
        const superAdminTenant = await Tenant.create({
            name: 'PG CRM SaaS Owner',
            ownerName: 'Super Admin',
            email: 'superadmin@pgcrm.com',
            phone: '1234567890',
            planId: superAdminPlan._id,
            planStatus: 'active',
            planExpiryDate: new Date('2099-12-31'), // Far future for owner
            employeeLimit: 9999,
            leadLimit: 999999,
            status: 'active',
        });

        // Create the Super Admin User
        await User.create({
            tenantId: superAdminTenant._id,
            name: 'Super Admin',
            email: 'admin@pgcrm.com',
            phone: '1234567890',
            password: 'password123', // Default easy password
            role: 'super_admin',
            status: 'Active',
        });

        console.log('Successfully seeded Super Admin (admin@pgcrm.com / password123)');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSuperAdmin();
