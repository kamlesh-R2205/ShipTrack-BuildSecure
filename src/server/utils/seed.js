require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const SecurityLog = require('../models/SecurityLog');
const { ROLES, SHIPMENT_STATUS } = require('../config/constants');
const { generateTrackingNumber } = require('./trackingGenerator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shiptrack';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB.');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shipment.deleteMany({}),
      SecurityLog.deleteMany({}),
    ]);
    console.log('[SEED] Cleared previous database collections.');

    // 1. Create Core Users across roles
    const admin = await User.create({
      name: 'Security Admin',
      email: 'admin@shiptrack.io',
      password: 'Admin@Secure2026!',
      role: ROLES.ADMIN,
      phone: '+91-9876543210',
    });

    const driver1 = await User.create({
      name: 'Ravi Kumar (Express Fleet)',
      email: 'driver1@shiptrack.io',
      password: 'Driver1@Secure2026!',
      role: ROLES.DRIVER,
      phone: '+91-9876543211',
    });

    const driver2 = await User.create({
      name: 'Anil Sharma (Cargo Fleet)',
      email: 'driver2@shiptrack.io',
      password: 'Driver2@Secure2026!',
      role: ROLES.DRIVER,
      phone: '+91-9876543212',
    });

    const customer1 = await User.create({
      name: 'Sneha Reddy',
      email: 'customer1@shiptrack.io',
      password: 'Customer1@Secure2026!',
      role: ROLES.CUSTOMER,
      phone: '+91-9876543213',
    });

    const customer2 = await User.create({
      name: 'Vikram Mehta',
      email: 'customer2@shiptrack.io',
      password: 'Customer2@Secure2026!',
      role: ROLES.CUSTOMER,
      phone: '+91-9876543214',
    });

    console.log('[SEED] Created 1 Admin, 2 Drivers, and 2 Customers.');

    // 2. Create Sample Shipments with clear ownership relationships
    // Shipment 1: Owned by Customer 1, Assigned to Driver 1
    const shipment1 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer1._id,
      assignedDriver: driver1._id,
      senderDetails: {
        name: customer1.name,
        phone: customer1.phone,
        address: 'Plot 42, Hitec City',
        city: 'Hyderabad',
        postalCode: '500081',
      },
      receiverDetails: {
        name: 'Pooja Varma',
        phone: '+91-9123456780',
        address: 'B-104, Indiranagar',
        city: 'Bengaluru',
        postalCode: '560038',
      },
      packageDetails: {
        weightKg: 2.5,
        description: 'Encrypted Hardware Security Module (HSM)',
        isFragile: true,
        declaredValue: 45000,
        dimensions: { lengthCm: 25, widthCm: 15, heightCm: 10 },
      },
      status: SHIPMENT_STATUS.ASSIGNED,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer1._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 3600000 * 4),
          note: 'Shipment created online by sender.',
          location: 'Hyderabad',
        },
        {
          status: SHIPMENT_STATUS.ASSIGNED,
          changedBy: admin._id,
          changedByRole: ROLES.ADMIN,
          timestamp: new Date(Date.now() - 3600000 * 2),
          note: `Assigned to driver ${driver1.name}`,
          location: 'Central Dispatch Hub',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2),
    });

    // Shipment 2: Owned by Customer 2, Unassigned (CREATED)
    const shipment2 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer2._id,
      assignedDriver: null,
      senderDetails: {
        name: customer2.name,
        phone: customer2.phone,
        address: 'Flat 302, Jubilee Hills',
        city: 'Hyderabad',
        postalCode: '500033',
      },
      receiverDetails: {
        name: 'Arjun Das',
        phone: '+91-9234567890',
        address: 'Tower 4, Bandra Kurla Complex',
        city: 'Mumbai',
        postalCode: '400051',
      },
      packageDetails: {
        weightKg: 5.0,
        description: 'Server Rack Mount Accessories',
        isFragile: false,
        declaredValue: 12000,
        dimensions: { lengthCm: 50, widthCm: 30, heightCm: 20 },
      },
      status: SHIPMENT_STATUS.CREATED,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer2._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 3600000 * 1),
          note: 'Awaiting hub dispatch.',
          location: 'Hyderabad',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3),
    });

    // Shipment 3: Owned by Customer 1, Assigned to Driver 2, IN_TRANSIT
    const shipment3 = await Shipment.create({
      trackingNumber: generateTrackingNumber(),
      sender: customer1._id,
      assignedDriver: driver2._id,
      senderDetails: {
        name: customer1.name,
        phone: customer1.phone,
        address: 'Gachibowli Tech Enclave',
        city: 'Hyderabad',
        postalCode: '500032',
      },
      receiverDetails: {
        name: 'Kavita Nair',
        phone: '+91-9345678901',
        address: 'Sector 62',
        city: 'Noida',
        postalCode: '201301',
      },
      packageDetails: {
        weightKg: 1.2,
        description: 'Biometric Smart Cards',
        isFragile: true,
        declaredValue: 25000,
      },
      status: SHIPMENT_STATUS.IN_TRANSIT,
      statusHistory: [
        {
          status: SHIPMENT_STATUS.CREATED,
          changedBy: customer1._id,
          changedByRole: ROLES.CUSTOMER,
          timestamp: new Date(Date.now() - 86400000 * 2),
          note: 'Created by sender',
          location: 'Hyderabad',
        },
        {
          status: SHIPMENT_STATUS.ASSIGNED,
          changedBy: admin._id,
          changedByRole: ROLES.ADMIN,
          timestamp: new Date(Date.now() - 86400000),
          note: 'Assigned to driver 2',
          location: 'Dispatch Hub',
        },
        {
          status: SHIPMENT_STATUS.PICKED_UP,
          changedBy: driver2._id,
          changedByRole: ROLES.DRIVER,
          timestamp: new Date(Date.now() - 3600000 * 12),
          note: 'Picked up from sender facility',
          location: 'Gachibowli Hub',
        },
        {
          status: SHIPMENT_STATUS.IN_TRANSIT,
          changedBy: driver2._id,
          changedByRole: ROLES.DRIVER,
          timestamp: new Date(Date.now() - 3600000 * 6),
          note: 'Departed sorting facility on line-haul',
          location: 'Hyderabad Transit Hub',
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + 86400000),
    });

    console.log('[SEED] Created 3 initial shipments with distinct owners and drivers.');
    console.log('--- SAMPLE ACCOUNTS FOR TESTING ---');
    console.log('ADMIN:     admin@shiptrack.io     / Admin@Secure2026!');
    console.log('DRIVER 1:  driver1@shiptrack.io   / Driver1@Secure2026!');
    console.log('DRIVER 2:  driver2@shiptrack.io   / Driver2@Secure2026!');
    console.log('CUSTOMER 1: customer1@shiptrack.io / Customer1@Secure2026!');
    console.log('CUSTOMER 2: customer2@shiptrack.io / Customer2@Secure2026!');
    console.log('-----------------------------------');

    await mongoose.disconnect();
    console.log('[SEED] Completed successfully.');
  } catch (err) {
    console.error('[SEED_ERROR]', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
