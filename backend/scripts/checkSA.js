require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'admin@pgcrm.com' });
        console.log('User found:', user);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
