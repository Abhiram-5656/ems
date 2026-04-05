// cat > backend/src/seeds/seedAdmin.js << 'EOF'
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config/environment.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Create roles if they don't exist
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    const hrRole = await Role.findOne({ name: 'HR' });
    const managerRole = await Role.findOne({ name: 'MANAGER' });
    const employeeRole = await Role.findOne({ name: 'EMPLOYEE' });

    if (!adminRole) {
      await Role.create({ name: 'ADMIN', description: 'Administrator' });
      console.log('✅ Created ADMIN role');
    }

    if (!hrRole) {
      await Role.create({ name: 'HR', description: 'Human Resources' });
      console.log('✅ Created HR role');
    }

    if (!managerRole) {
      await Role.create({ name: 'MANAGER', description: 'Manager' });
      console.log('✅ Created MANAGER role');
    }

    if (!employeeRole) {
      await Role.create({ name: 'EMPLOYEE', description: 'Employee' });
      console.log('✅ Created EMPLOYEE role');
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@ems.com' });

    if (!existingAdmin) {
      // Get admin role
      const role = await Role.findOne({ name: 'ADMIN' });

      // Create admin user - password will be hashed by User model pre-save hook
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ems.com',
        phone: '1234567890',
        password: 'Admin@123',
        role: role._id,
        isActive: true,
        isEmailVerified: true,
        joinDate: new Date(),
      });

      console.log('✅ Created Admin User');
      console.log('   Email: admin@ems.com');
      console.log('   Password: Admin@123');
      console.log('');
    } else {
      console.log('✅ Admin user already exists');
      console.log('   Email: admin@ems.com');
    }

    // Create sample HR user
    const existingHR = await User.findOne({ email: 'hr@ems.com' });

    if (!existingHR) {
      const role = await Role.findOne({ name: 'HR' });

      await User.create({
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr@ems.com',
        phone: '9876543210',
        password: 'HR@123',
        role: role._id,
        isActive: true,
        isEmailVerified: true,
        joinDate: new Date(),
      });

      console.log('✅ Created HR User');
      console.log('   Email: hr@ems.com');
      console.log('   Password: HR@123');
      console.log('');
    }

    // Create sample Manager user
    const existingManager = await User.findOne({ email: 'manager@ems.com' });

    if (!existingManager) {
      const role = await Role.findOne({ name: 'MANAGER' });

      await User.create({
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@ems.com',
        phone: '5555555555',
        password: 'Manager@123',
        role: role._id,
        isActive: true,
        isEmailVerified: true,
        joinDate: new Date(),
      });

      console.log('✅ Created Manager User');
      console.log('   Email: manager@ems.com');
      console.log('   Password: Manager@123');
      console.log('');
    }

    // Create sample Employee user
    const existingEmployee = await User.findOne({ email: 'employee@ems.com' });

    if (!existingEmployee) {
      const role = await Role.findOne({ name: 'EMPLOYEE' });

      await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@ems.com',
        phone: '3333333333',
        password: 'Employee@123',
        role: role._id,
        department: 'IT',
        position: 'Software Engineer',
        salary: 50000,
        isActive: true,
        isEmailVerified: true,
        joinDate: new Date(),
      });

      console.log('✅ Created Employee User');
      console.log('   Email: employee@ems.com');
      console.log('   Password: Employee@123');
      console.log('');
    }

    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed successfully!');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedAdmin();
// EOF