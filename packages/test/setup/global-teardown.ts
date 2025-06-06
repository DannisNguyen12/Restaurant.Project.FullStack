import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up test data if needed
    const { PrismaClient } = require('@repo/database');
    const prisma = new PrismaClient();
    
    // Clean up test data (optional - depends on your testing strategy)
    // await prisma.like.deleteMany({});
    // await prisma.orderItem.deleteMany({});
    // await prisma.order.deleteMany({});
    
    await prisma.$disconnect();
    
    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - let tests complete even if cleanup fails
  }
}

export default globalTeardown;
