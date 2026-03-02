require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { generateToken } = require('../src/modules/auth/auth.service');

async function testPost() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminUser = await User.findOne({ role: 'super_admin' });
        if (!adminUser) {
            console.log("Super admin not found.");
            process.exit(1);
        }

        const token = generateToken(adminUser);

        const payload = {
            name: 'Test Tenant 123',
            ownerName: 'Test Owner',
            email: 'test_creation123@example.com',
            phone: '1234567890',
            password: 'VendorPassword123!',
            employeeLimit: 5,
            leadLimit: 100,
            planExpiryDate: '2027-01-01',
            status: 'active',
            planStatus: 'active'
        };

        const res = await axios.post('http://localhost:5001/api/super-admin/tenants', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("SUCCESS RESPONSE:");
        console.log(res.data);
    } catch (err) {
        console.log("API FAILED WITH STATUS:", err.response?.status);
        console.log("ERROR DATA:", JSON.stringify(err.response?.data, null, 2));
    } finally {
        process.exit(0);
    }
}

testPost();
