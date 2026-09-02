import { MediaType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UPLOADS_ROOT } from '../src/media/storage/media-storage.config';
import { resolveMediaTypeFolder } from '../src/media/storage/media-storage.helper';

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'demo@homestreamlab.com';
const DEMO_USER_PASSWORD = 'Password123!';

// Resolve seed assets from the backend process working directory (the stable
// application root) so both local development (`backend/`) and the production
// container (`/app`) find them under `prisma/seed-assets`. After Nest build,
// `__dirname` would be `dist/prisma`, where the assets are not copied.
const SEED_ASSETS_ROOT = join(process.cwd(), 'prisma', 'seed-assets');

interface DemoMediaFixture {
  title: string;
  description: string;
  type: MediaType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

const DEMO_MEDIA_FIXTURES: DemoMediaFixture[] = [
  {
    title: 'Demo Video',
    description: 'Example video metadata for local development.',
    type: MediaType.VIDEO,
    originalName: 'demo-video.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 3050,
  },
  {
    title: 'Demo Document',
    description: 'Example document metadata for local development.',
    type: MediaType.DOCUMENT,
    originalName: 'demo-document.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 602,
  },
  {
    title: 'Demo Photo',
    description: 'Example photo metadata for local development.',
    type: MediaType.PHOTO,
    originalName: 'demo-photo.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 673,
  },
];

function seedDemoMediaFiles(): void {
  for (const fixture of DEMO_MEDIA_FIXTURES) {
    const typeFolder = resolveMediaTypeFolder(fixture.type);
    const destinationDir = join(UPLOADS_ROOT, typeFolder);
    mkdirSync(destinationDir, { recursive: true });
    copyFileSync(
      join(SEED_ASSETS_ROOT, fixture.originalName),
      join(destinationDir, fixture.originalName),
    );
  }
}

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

  seedDemoMediaFiles();

  await prisma.mediaItem.createMany({
    data: DEMO_MEDIA_FIXTURES.map((fixture) => ({
      title: fixture.title,
      description: fixture.description,
      type: fixture.type,
      category: 'Demo',
      originalName: fixture.originalName,
      fileName: fixture.originalName,
      mimeType: fixture.mimeType,
      sizeBytes: fixture.sizeBytes,
      filePath: join(
        resolveMediaTypeFolder(fixture.type),
        fixture.originalName,
      ),
      uploadedById: demoUser.id,
    })),
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
