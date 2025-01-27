import fs from 'fs/promises';
import path from 'path';

async function exportProject() {
  // Create export directories
  await fs.mkdir('export', { recursive: true });
  await fs.mkdir('export/backend/src', { recursive: true });
  await fs.mkdir('export/frontend', { recursive: true });

  // Define the simplified backend structure
  const backendStructure = {
    'src/routes': ['authRoutes.js', 'files.js'],
    'src/controllers': ['authController.js', 'files.js'],
    'src/services': ['authService.js', 'fileService.js'],
    'src/repositories': ['fileRepository.js', 'userRepository.js'],
    'src/models': ['File.js', 'User.js'],
    'src/middleware': ['auth.js', 'errorHandler.js']
  };

  // Copy backend files with simplified structure
  for (const [dir, files] of Object.entries(backendStructure)) {
    await fs.mkdir(`export/backend/${dir}`, { recursive: true });
    
    for (const file of files) {
      try {
        await fs.copyFile(
          path.join(process.cwd(), 'backend', dir, file),
          path.join(process.cwd(), 'export/backend', dir, file)
        );
      } catch (error) {
        console.error(`Error copying ${dir}/${file}:`, error);
      }
    }
  }

  // Copy backend root files
  const backendRootFiles = ['package.json', '.env.example'];
  for (const file of backendRootFiles) {
    try {
      await fs.copyFile(
        path.join(process.cwd(), 'backend', file),
        path.join(process.cwd(), 'export/backend', file)
      );
    } catch (error) {
      console.error(`Error copying backend/${file}:`, error);
    }
  }

  // Copy backend index.js
  try {
    await fs.copyFile(
      path.join(process.cwd(), 'backend/src/index.js'),
      path.join(process.cwd(), 'export/backend/src/index.js')
    );
  } catch (error) {
    console.error('Error copying backend/src/index.js:', error);
  }

  // Frontend files to copy
  const frontendFiles = [
    'src',
    'public',
    'index.html',
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.node.json',
    'postcss.config.js',
    'tailwind.config.js',
    '.env.example'
  ];

  // Copy frontend files
  for (const file of frontendFiles) {
    const sourcePath = path.join(process.cwd(), 'frontend', file);
    const targetPath = path.join(process.cwd(), 'export/frontend', file);
    
    try {
      await fs.cp(sourcePath, targetPath, { recursive: true });
    } catch (error) {
      console.error(`Error copying frontend/${file}:`, error);
    }
  }

  // Create README files
  const backendReadme = `# Backend API

A Node.js backend service with authentication and MongoDB.

## Simplified Architecture
- Routes: API route definitions
- Controllers: Request handling and response formatting
- Services: Business logic implementation
- Repositories: Data access layer
- Models: Database schemas
- Middleware: Request middleware functions

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create .env file:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/app
   JWT_SECRET=your_jwt_secret_key_here
   CORS_ORIGIN=http://localhost:5173
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure
\`\`\`
src/
├── routes/          # Route definitions
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access
├── models/          # Database schemas
├── middleware/      # Express middleware
└── index.js         # Application entry
\`\`\``;

  const frontendReadme = `# Frontend Application

A React-based frontend with authentication and modern tooling.

## Features
- User authentication
- LinkedIn OAuth integration
- TypeScript support
- Vite for fast development
- Tailwind CSS for styling

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create .env file:
   \`\`\`
   VITE_API_URL=http://localhost:5000/api
   VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure
\`\`\`
src/
├── components/      # React components
├── contexts/        # React contexts
├── lib/            # Utilities and API
└── App.tsx         # Root component
\`\`\``;

  await fs.writeFile('export/backend/README.md', backendReadme);
  await fs.writeFile('export/frontend/README.md', frontendReadme);

  // Create .env.example files
  const backendEnvExample = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/app
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret`;

  const frontendEnvExample = `VITE_API_URL=http://localhost:5000/api
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id`;

  await fs.writeFile('export/backend/.env.example', backendEnvExample);
  await fs.writeFile('export/frontend/.env.example', frontendEnvExample);

  console.log('Project exported successfully to export/ directory');
}

exportProject().catch(console.error);