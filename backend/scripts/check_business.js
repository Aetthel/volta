const prisma = require("../src/db");

async function main() {
  // Migrate all old colour keys to new ones
  const migrations = [
    { from: "TEAL", to: "CLINICAL_ELEGANCE" },
    { from: "INDIGO", to: "CLINICAL_ELEGANCE" },
    { from: "ROSE", to: "ORCHID_SERENITY" },
    { from: "AMBER", to: "WARM_SAND" },
    { from: "EMERALD", to: "ORGANIC_VITALITY" },
  ];

  for (const { from, to } of migrations) {
    const r = await prisma.business.updateMany({
      where: { themeColor: from },
      data: { themeColor: to },
    });
    if (r.count > 0) console.log(`Migrated ${r.count} business(es) from ${from} → ${to}`);
  }

  const businesses = await prisma.business.findMany({
    select: { id: true, themeColor: true, fontSizeLevel: true, borderRadiusLevel: true },
  });
  console.log("Current state:", JSON.stringify(businesses, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
