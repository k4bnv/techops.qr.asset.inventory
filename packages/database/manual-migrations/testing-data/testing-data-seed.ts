/* eslint-disable no-console */
import type { User } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL environment variable is required");
  }

  const user = (await prisma.user.findFirst({
    where: { email: adminEmail },
  })) as User;

  if (!user) {
    throw new Error(`No user found with email: ${adminEmail}`);
  }

  const org = await prisma.organization.findFirst({
    where: { userId: user.id },
  });

  if (!org) {
    throw new Error(`No organization found for user: ${user.id}`);
  }

  const times = 100;
  const assets = [];
  for (let i = 0; i < times; i++) {
    assets.push({
      title: `Asset ${i}`,
      description: `Asset ${i} description`,
      userId: user.id,
      organizationId: org.id,
    });
  }

  await Promise.all(
    assets.map(async (asset) => {
      await prisma.asset.create({ data: asset });
    })
  );

  console.log(`✅ Seeded ${times} assets for organization ${org.id}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
