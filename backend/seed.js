const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Lead = require('./src/models/Lead');
const Activity = require('./src/models/Activity');
const Booking = require('./src/models/Booking');
const Visit = require('./src/models/Visit');
const connectDB = require('./src/config/db');

const seedData = async () => {
    try {
        await connectDB();

        // Clear db
        await User.deleteMany();
        await Lead.deleteMany();
        await Activity.deleteMany();
        await Booking.deleteMany();
        await Visit.deleteMany();

        // Create Admin
        const admin = await User.create({
            name: 'Soumya Admin',
            email: 'admin@pgcrm.com',
            phone: '9999999999',
            password: 'password123',
            role: 'Admin',
        });

        // Create Sales Agents
        const sales1 = await User.create({
            name: 'Rahul Sharma',
            email: 'rahul@pgcrm.com',
            phone: '9876543210',
            password: 'password123',
            role: 'Sales',
            assignedAreas: ['Koramangala', 'HSR Layout'],
            monthlyTarget: 10,
        });

        const sales2 = await User.create({
            name: 'Priya Patel',
            email: 'priya@pgcrm.com',
            phone: '9876543211',
            password: 'password123',
            role: 'Sales',
            assignedAreas: ['BTM Layout', 'Indiranagar'],
            monthlyTarget: 8,
        });

        // Create Field Agent
        const field1 = await User.create({
            name: 'Amit Kumar',
            email: 'amit@pgcrm.com',
            phone: '9876543212',
            password: 'password123',
            role: 'Field',
        });

        // Create Some Leads
        const lead1 = await Lead.create({
            name: 'Neha Singh',
            phone: '9123456780',
            preferredArea: 'Koramangala',
            budget: 15000,
            propertyType: 'PG',
            genderRequirement: 'Girls',
            stage: 'Visit',
            source: 'Facebook',
            assignedTo: sales1._id,
            createdBy: admin._id,
        });

        const lead2 = await Lead.create({
            name: 'Suresh Raina',
            phone: '9123456781',
            preferredArea: 'Indiranagar',
            budget: 12000,
            stage: 'New',
            source: 'Portal',
            assignedTo: sales2._id,
            createdBy: sales2._id,
        });

        const lead3 = await Lead.create({
            name: 'Virat Kohli',
            phone: '9123456782',
            stage: 'Booked',
            assignedTo: sales1._id,
            createdBy: sales1._id,
        });

        // Create a booking
        await Booking.create({
            leadId: lead3._id,
            propertyName: 'Kohli PG',
            bedAssigned: 'Room 5 - Bed A',
            advancePaid: 5000,
            bookingDate: new Date(),
            createdBy: sales1._id,
        });

        // Create activities
        await Activity.create({
            leadId: lead1._id,
            type: 'LEAD_CREATED',
            description: 'Lead created from Facebook',
            performedBy: admin._id
        });

        console.log('Data Imported successfully');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
