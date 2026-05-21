import { MediaType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoEmail = 'demo@homestreamlab.com';

  const existingDemoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (existingDemoUser) {
    await prisma.mediaItem.deleteMany({
      where: { uploadedById: existingDemoUser.id },
    });

    await prisma.user.delete({
      where: { id: existingDemoUser.id },
    });
  }

  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      displayName: 'Demo User',
      passwordHash: 'demo-password-hash-placeholder',
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
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
