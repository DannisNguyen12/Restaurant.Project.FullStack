// This script tests the database connection and displays basic stats
import { prisma } from '../index';

async function main() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Count records in main tables
    const [categoriesCount, itemsCount, usersCount, ordersCount] = await Promise.all([
      prisma.category.count(),
      prisma.item.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);
    
    console.log('\nDatabase Statistics:');
    console.log('-------------------');
    console.log(`Categories: ${categoriesCount}`);
    console.log(`Menu Items: ${itemsCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Orders: ${ordersCount}`);
    
    // List all categories
    const categories = await prisma.category.findMany();
    console.log('\nAvailable Categories:');
    console.log('-------------------');
    categories.forEach(cat => console.log(`- ${cat.name} (ID: ${cat.id})`));
    
    // List a sample of items
    const items = await prisma.item.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('\nSample Menu Items:');
    console.log('-------------------');
    items.forEach(item => console.log(`- ${item.name} - $${item.price} (Category: ${item.category?.name || 'None'})`));
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
