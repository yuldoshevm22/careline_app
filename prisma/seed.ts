import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Products
  const products = [
    { name: 'Детский', dimensions: '22x25', defaultPrice: 0, sortOrder: 1 },
    { name: 'Для лица', dimensions: '22x25', defaultPrice: 0, sortOrder: 2 },
    { name: 'Тахланган каробка', dimensions: '45x90', defaultPrice: 0, sortOrder: 3 },
    { name: 'Рулон каробка', dimensions: '35x70', defaultPrice: 0, sortOrder: 4 },
    { name: 'Рулон без каробки', dimensions: '35x70', defaultPrice: 0, sortOrder: 5 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `seed-product-${product.sortOrder}` },
      update: product,
      create: { id: `seed-product-${product.sortOrder}`, ...product },
    });
  }
  console.log('✅ Products seeded');

  // Seed Expense Types
  const expenseTypes = ['Зарплата', 'Транспорт', 'Аренда', 'Сырьё', 'Ремонт', 'Прочее'];
  for (const name of expenseTypes) {
    await prisma.expenseType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Expense types seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
