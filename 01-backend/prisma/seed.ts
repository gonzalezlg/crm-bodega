import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const ownerRole = await prisma.rol.upsert({
    where: { nombre: 'owner' },
    update: {
      descripcion: 'Dueño o administrador con control total del sistema.',
    },
    create: {
      nombre: 'owner',
      descripcion: 'Dueño o administrador con control total del sistema.',
    },
  });

  await prisma.rol.upsert({
    where: { nombre: 'employee' },
    update: {
      descripcion: 'Empleado con acceso operativo al CRM.',
    },
    create: {
      nombre: 'employee',
      descripcion: 'Empleado con acceso operativo al CRM.',
    },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await prisma.usuario.upsert({
    where: { email: 'admin@crmbodega.local' },
    update: {
      dni: '30123456',
      nombre: 'María Fernández',
      passwordHash,
      activo: true,
      rolId: ownerRole.id,
    },
    create: {
      dni: '30123456',
      nombre: 'María Fernández',
      email: 'admin@crmbodega.local',
      passwordHash,
      activo: true,
      rolId: ownerRole.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
