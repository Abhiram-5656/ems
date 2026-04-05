import mongoose from 'mongoose';
import config from '../config/environment.js';
import User from '../models/User.js';

const cleanup = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Delete all test users
    const result = await User.deleteMany({
      email: {
        $in: ['admin@ems.com', 'hr@ems.com', 'manager@ems.com', 'employee@ems.com'],
      },
    });

    console.log(`✅ Deleted ${result.deletedCount} test users`);
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
};

cleanup();
