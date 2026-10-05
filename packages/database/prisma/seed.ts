import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (const name of ["Aventure", "Comédie", "Documentaire", "Drame", "Policier", "Science-fiction", "Thriller"]) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());