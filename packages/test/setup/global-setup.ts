import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Wait for database to be ready
    console.log('📊 Setting up test database...');
    
    // Reset and seed test database
    await execAsync('cd ../../packages/database && npx prisma migrate reset --force --skip-seed');
    await execAsync('cd ../../packages/database && npx prisma db seed');
    
    console.log('✅ Test database setup complete');
    
    // Additional setup for test users
    await createTestUsers();
    
    console.log('✅ Global setup complete');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

async function createTestUsers() {
  const { PrismaClient } = require('@repo/database');
  const bcrypt = require('bcryptjs');
  
  const prisma = new PrismaClient();
  
  try {
    // Create test admin user
    await prisma.user.upsert({
      where: { email: 'admin@restaurant.test' },
      update: {},
      create: {
        email: 'admin@restaurant.test',
        name: 'Test Admin',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
      },
    });

    // Create test customer user
    await prisma.user.upsert({
      where: { email: 'user@restaurant.test' },
      update: {},
      create: {
        email: 'user@restaurant.test',
        name: 'Test Customer',
        password: await bcrypt.hash('user123', 12),
        role: 'USER',
      },
    });

    console.log('✅ Test users created');
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
