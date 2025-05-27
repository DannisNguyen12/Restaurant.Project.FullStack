// prisma/seed.ts

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed categories
  const appetizer = await prisma.category.upsert({
    where: { name: 'Appetizer' },
    update: {},
    create: { name: 'Appetizer' },
  });

  const mainCourse = await prisma.category.upsert({
    where: { name: 'Main Course' },
    update: {},
    create: { name: 'Main Course' },
  });

  const dessert = await prisma.category.upsert({
    where: { name: 'Dessert' },
    update: {},
    create: { name: 'Dessert' },
  });

  console.log(`✅ Created categories: ${appetizer.name}, ${mainCourse.name}, ${dessert.name}`);

  // Seed items
  const phoBo = await prisma.item.create({
    data: {
      name: 'Pho Bo',
      description: 'Traditional Vietnamese beef noodle soup.',
      fullDescription:
        'Pho bo is one of Vietnam’s most iconic dishes. Made with slow-cooked beef bones, aromatic spices, and fresh rice noodles, it delivers deep umami flavor in every spoonful.',
      price: 12.99,
      image: 'https://placehold.co/600x400?text=Pho+Bo ',
      ingredients: ['Beef bones', 'Rice noodles', 'Star anise', 'Cloves', 'Ginger', 'Onion', 'Fish sauce'],
      servingTips: [
        'Stir well before eating to mix flavors.',
        'Add lime juice and chili sauce to taste.',
        'Enjoy the broth first, then the noodles and meat.',
      ],
      recommendations: ['Vietnamese Iced Coffee', 'Spring Rolls', 'Pickled vegetables'],
      categoryId: mainCourse.id,
    },
  });

  const banhMi = await prisma.item.create({
    data: {
      name: 'Banh Mi',
      description: 'A delicious fusion of flavors in a crispy baguette.',
      fullDescription:
        'Banh Mi is a classic Vietnamese sandwich made with a crispy baguette, pickled veggies, herbs, and your choice of protein.',
      price: 8.99,
      image: 'https://placehold.co/600x400?text=Banh+Mi ',
      ingredients: ['Baguette', 'Pâté', 'Pickled carrots', 'Cucumber', 'Chili sauce'],
      servingTips: ['Eat while warm for best texture.', 'Pair with a cold drink.'],
      recommendations: ['Fruit smoothie', 'Iced coffee'],
      categoryId: mainCourse.id,
    },
  });

  const springRolls = await prisma.item.create({
    data: {
      name: 'Spring Rolls',
      description: 'Fresh rolls wrapped in rice paper with herbs and vegetables.',
      fullDescription:
        'These fresh Vietnamese spring rolls are filled with shrimp, vermicelli noodles, mint, lettuce, and other fresh veggies — light and healthy!',
      price: 6.99,
      image: 'https://placehold.co/600x400?text=Spring+Rolls ',
      ingredients: ['Shrimp', 'Vermicelli noodles', 'Lettuce', 'Mint', 'Carrots', 'Rice paper'],
      servingTips: ['Dip in peanut or hoisin sauce.', 'Eat within 30 minutes of preparation.'],
      recommendations: ['Tofu soup', 'Green tea'],
      categoryId: appetizer.id,
    },
  });

  const tiramisu = await prisma.item.create({
    data: {
      name: 'Tiramisu',
      description: 'Classic Italian layered dessert with espresso-soaked ladyfingers.',
      fullDescription:
        'A rich, creamy, and indulgent dessert made with mascarpone cheese, cocoa powder, and strong brewed coffee.',
      price: 7.99,
      image: 'https://placehold.co/600x400?text=Tiramisu ',
      ingredients: ['Ladyfingers', 'Espresso', 'Mascarpone', 'Eggs', 'Sugar', 'Cocoa powder'],
      servingTips: ['Best served chilled.', 'Let sit for 5 mins after refrigeration.'],
      recommendations: ['Coffee', 'Sweet wine'],
      categoryId: dessert.id,
    },
  });

  console.log(
    `✅ Created items: ${phoBo.name}, ${banhMi.name}, ${springRolls.name}, ${tiramisu.name}`
  );

  // Seed users
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Nguyen',
      password: '123',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Johnson',
      password: '123',
    },
  });

  console.log(`✅ Created users: ${user1.name}, ${user2.name}`);

  // Seed likes
  await prisma.like.createMany({
    data: [
      { userId: user1.id, itemId: phoBo.id, type: 'LIKE' },
      { userId: user1.id, itemId: springRolls.id, type: 'DISLIKE' },
      { userId: user2.id, itemId: banhMi.id, type: 'LIKE' },
      { userId: user2.id, itemId: tiramisu.id, type: 'LIKE' },
    ],
  });

  console.log('✅ Created likes');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 