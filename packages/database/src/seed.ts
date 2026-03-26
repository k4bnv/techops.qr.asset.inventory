import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Roles
  const roles = ["USER", "ADMIN"];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName as any },
      update: {},
      create: {
        name: roleName as any,
      },
    });
  }
  console.log("✅ Roles seeded");

  // 2. Seed Tiers
  const tiers = [
    { id: "free", name: "Free" },
    { id: "tier_1", name: "Plus" },
    { id: "tier_2", name: "Team" },
    { id: "custom", name: "Custom" },
  ];

  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { id: tier.id as any },
      update: { name: tier.name },
      create: {
        id: tier.id as any,
        name: tier.name,
      },
    });
  }
  console.log("✅ Tiers seeded");

  // 3. Seed TierLimits
  for (const tier of tiers) {
    await prisma.tierLimit.upsert({
      where: { id: tier.id as any },
      update: {},
      create: {
        id: tier.id as any,
        canImportAssets: tier.id !== "free",
        canExportAssets: tier.id !== "free",
        maxAssets: tier.id === "free" ? 50 : 0, // 0 usually means unlimited in this app's logic or a high number
        canInviteTeamMembers: tier.id !== "free",
      },
    });

    // Link Tier to TierLimit
    await prisma.tier.update({
      where: { id: tier.id as any },
      data: { tierLimitId: tier.id as any },
    });
  }
  console.log("✅ TierLimits seeded and linked");

  // 4. Seed SiteConfig (Nav Settings)
  const navSettings = {
    home: { visible: true, customUrl: null },
    assets: { visible: true, customUrl: null },
    kits: { visible: true, customUrl: null },
    categories: { visible: true, customUrl: null },
    tags: { visible: true, customUrl: null },
    locations: { visible: true, customUrl: null },
    audits: { visible: true, customUrl: null },
    bookings: { visible: true, customUrl: null },
    reminders: { visible: true, customUrl: null },
    team: { visible: true, customUrl: null },
    workspaceSettings: { visible: true, customUrl: null },
    scanner: { visible: true, customUrl: null },
  };

  await prisma.siteConfig.upsert({
    where: { key: "navSettings" },
    update: { value: navSettings as any },
    create: {
      key: "navSettings",
      value: navSettings as any,
    },
  });
  console.log("✅ SiteConfig seeded");

  console.log("🏁 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
