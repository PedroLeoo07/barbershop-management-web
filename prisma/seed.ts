import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barbershop.com' },
    update: {},
    create: {
      email: 'admin@barbershop.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create barber
  const barberPassword = await hashPassword('barber123');
  const barber = await prisma.user.upsert({
    where: { email: 'barber@barbershop.com' },
    update: {},
    create: {
      email: 'barber@barbershop.com',
      password: barberPassword,
      name: 'João Silva',
      phone: '11999999999',
      role: 'BARBER',
      barberDetails: {
        create: {
          specialties: ['Corte masculino', 'Barba'],
          bio: 'Barbeiro profissional com 10 anos de experiência',
          workingDays: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '18:00',
          commissionRate: 0.5,
        },
      },
    },
  });

  console.log('✅ Barber created:', barber.email);

  // Create services
  const services = [
    { name: 'Corte Masculino', price: 50, duration: 30, category: 'Cabelo' },
    { name: 'Barba', price: 30, duration: 20, category: 'Barba' },
    { name: 'Corte + Barba', price: 70, duration: 45, category: 'Combo' },
    { name: 'Hidratação', price: 80, duration: 60, category: 'Tratamento' },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }

  console.log(`✅ ${services.length} services created`);

  // Create client
  const clientPassword = await hashPassword('client123');
  const client = await prisma.user.upsert({
    where: { email: 'client@barbershop.com' },
    update: {},
    create: {
      email: 'client@barbershop.com',
      password: clientPassword,
      name: 'Carlos Santos',
      phone: '11988888888',
      role: 'CLIENT',
      clientDetails: {
        create: {},
      },
    },
  });

  console.log('✅ Client created:', client.email);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Admin: admin@barbershop.com / admin123');
  console.log('   Barber: barber@barbershop.com / barber123');
  console.log('   Client: client@barbershop.com / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
