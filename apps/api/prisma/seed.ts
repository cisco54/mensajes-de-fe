import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const verses = [
  { book: 'Filipenses', chapter: 4, verse: '13', text: 'Todo lo puedo en Cristo que me fortalece.', theme: 'fortaleza', language: 'es' },
  { book: 'Jeremías', chapter: 29, verse: '11', text: 'Porque yo sé los planes que tengo para ti, planes de bien y no de mal.', theme: 'esperanza', language: 'es' },
  { book: '1 Corintios', chapter: 13, verse: '4-5', text: 'El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso.', theme: 'amor', language: 'es' },
  { book: 'Salmos', chapter: 23, verse: '1', text: 'Jehová es mi pastor; nada me faltará.', theme: 'proteccion', language: 'es' },
  { book: 'Mateo', chapter: 11, verse: '28', text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', theme: 'ansiedad', language: 'es' },
  { book: 'Proverbios', chapter: 3, verse: '5-6', text: 'Confía en Jehová con todo tu corazón, y no te apoyes en tu propia prudencia.', theme: 'fe', language: 'es' },
  { book: 'Marcos', chapter: 11, verse: '24', text: 'Por tanto, os digo que todo lo que orareis y pidiereis, creed que lo recibiréis.', theme: 'oracion', language: 'es' },
];

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@ejemplo.com';
  const password = process.env.ADMIN_PASSWORD || 'cambia_esta_clave_en_produccion';

  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (!existingUser) {
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, password: hash, role: 'admin' } });
    console.log('Admin created');
  }

  const existingVerse = await prisma.verse.findFirst();
  if (!existingVerse) {
    await prisma.verse.createMany({ data: verses });
    console.log('Seed verses created');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
