import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: { name: 'Summer Music Festival 2026' },
    orderBy: { createdAt: 'desc' }
  });

  if (events.length > 1) {
    console.log(`Found ${events.length} events. Deleting ${events.length - 1} duplicates...`);
    const idsToDelete = events.slice(1).map(e => e.id);
    
    await prisma.event.deleteMany({
      where: { id: { in: idsToDelete } }
    });
    console.log('Duplicates deleted successfully.');
  } else {
    console.log('No duplicates found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
