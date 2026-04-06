const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const transactions = await prisma.royaltyTransaction.findMany({
    where: { type: "WITHDRAWAL" },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log(JSON.stringify(transactions, null, 2));
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
