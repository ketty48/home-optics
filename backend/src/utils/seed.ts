import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const adminEmail = 'admin@hoho.com';
    const adminPassword = 'password123'; // Change this after logging in!

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      // If user exists, ensure they have admin role
      if (userExists.role !== 'admin') {
        userExists.role = 'admin';
        await userExists.save();
        console.log('Existing user updated to admin role');
      } else {
        console.log('Admin user already exists');
      }
    } else {
      await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+250700000000',
        isEmailVerified: true,
        addresses: [{
          street: 'Main Office',
          city: 'Kigali',
          state: 'Kigali',
          country: 'Rwanda',
          zipCode: '00000',
          isDefault: true
        }]
      });

      console.log('Admin user created successfully');
      console.log('-----------------------------------');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log('-----------------------------------');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();