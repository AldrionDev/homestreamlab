import { MediaType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'demo@homestreamlab.com';
const DEMO_USER_PASSWORD = 'Password123!';

async function main() {
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (existingDemoUser) {
    await prisma.mediaItem.deleteMany({
      where: { uploadedById: existingDemoUser.id },
    });

    await prisma.user.delete({
      where: { id: existingDemoUser.id },
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10);

  const demoUser = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      displayName: 'Demo User',
      passwordHash,
    },
  });

  await prisma.mediaItem.createMany({
    data: [
      {
        title: 'Demo Video',
        description: 'Example video metadata for local development.',
        type: MediaType.VIDEO,
        category: 'Demo',
        originalName: 'demo-video.mp4',
        fileName: 'demo-video.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 25_000_000,
        filePath: '/uploads/demo-video.mp4',
        uploadedById: demoUser.id,
      },
      {
        title: 'Demo Document',
        description: 'Example document metadata for local development.',
        type: MediaType.DOCUMENT,
        category: 'Demo',
        originalName: 'demo-document.pdf',
        fileName: 'demo-document.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 500_000,
        filePath: '/uploads/demo-document.pdf',
        uploadedById: demoUser.id,
      },
      {
        title: 'Demo Photo',
        description: 'Example photo metadata for local development.',
        type: MediaType.PHOTO,
        category: 'Demo',
        originalName: 'demo-photo.jpg',
        fileName: 'demo-photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 2_000_000,
        filePath: '/uploads/demo-photo.jpg',
        uploadedById: demoUser.id,
      },
    ],
  });

  console.log('Seed completed successfully.');
  console.log('Local demo login (development only):');
  console.log(`  Email:    ${DEMO_USER_EMAIL}`);
  console.log(`  Password: ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
