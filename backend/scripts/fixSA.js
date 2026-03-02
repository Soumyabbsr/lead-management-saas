require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const fixUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOneAndUpdate(
            { email: 'admin@pgcrm.com' },
            { role: 'super_admin' },
            { new: true }
        );
        console.log('User role updated to:', user.role);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixUser();
