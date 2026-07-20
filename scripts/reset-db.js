const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  // Delete all data
  await prisma.transaction.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.event.deleteMany();
  
  // Create a fresh event with all fields
  const event = await prisma.event.create({
    data: {
      id: 'evt_' + Date.now(),
      name: 'Sydney Street Eats Festival',
      description: 'A vibrant street food festival showcasing the best vendors in Sydney.',
      date: new Date('2026-08-15T10:00:00+10:00'),
      location: 'Darling Harbour, Sydney',
      commissionRate: 0.10,
      status: 'active',
    }
  });
  
  console.log(`Created fresh event: "${event.name}"`);
  console.log(`  Date: ${event.date}`);
  console.log(`  Location: ${event.location}`);
  console.log(`  ID: ${event.id}`);
  
  await prisma['$disconnect']();
}

main().catch(console.error);
