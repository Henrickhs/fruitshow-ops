import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fruitshow.com.br' },
    update: {},
    create: {
      name: 'Admin FruitShow',
      email: 'admin@fruitshow.com.br',
      passwordHash,
      role: 'admin'
    }
  });

  await prisma.onboardingStepTemplate.createMany({
    data: [
      { title: 'Validação de contrato e CNPJ', category: 'legal', defaultDays: 3, order: 1 },
      { title: 'Vistoria de infraestrutura', category: 'infrastructure', defaultDays: 10, order: 2 },
      { title: 'Compra e instalação de equipamentos', category: 'equipment', defaultDays: 20, order: 3 },
      { title: 'Treinamento da equipe', category: 'training', defaultDays: 25, order: 4 },
      { title: 'Campanha local de inauguração', category: 'marketing', defaultDays: 30, order: 5 }
    ],
    skipDuplicates: true
  });

  await prisma.questionnaire.upsert({
    where: { id: 'template-visita-operacional' },
    update: {},
    create: {
      id: 'template-visita-operacional',
      title: 'Visita operacional padrão',
      category: 'Operação',
      questions: {
        create: [
          { title: 'Loja limpa e organizada?', type: 'yes_no', weight: 2, order: 1 },
          { title: 'Temperatura dos freezers adequada?', type: 'numeric', weight: 2, order: 2 },
          { title: 'Registrar foto da vitrine', type: 'photo', weight: 1, order: 3 }
        ]
      }
    }
  });

  console.log(`Seed concluído. Login: ${admin.email} / admin123`);
}

main().finally(() => prisma.$disconnect());
