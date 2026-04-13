import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@foodhubaltra.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'FoodHub Altra Admin';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  const categories = ['Bengali', 'Fast Food', 'Dessert', 'Chinese', 'Healthy'];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: {},
      create: {
        name: categoryName,
        slug: slugify(categoryName),
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
