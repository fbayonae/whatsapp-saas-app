import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tg.es';
  const plainPassword = 'supersegura123';
  const name = 'Admin';
  const role = 'admin';

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  console.log('✅ Usuario creado:', user);
}

main()
  .catch(e => {
    console.error('❌ Error al crear usuario:', e);
  })
  .finally(() => prisma.$disconnect());
