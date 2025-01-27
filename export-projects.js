import fs from 'fs/promises';
import path from 'path';

async function exportProjects() {
  // Create export directories
  await fs.mkdir('export', { recursive: true });
  await fs.mkdir('export/backend', { recursive: true });
  await fs.mkdir('export/frontend', { recursive: true });

  // Backend files to copy
  const backendFiles = [
    'backend/package.json',
    'backend/src',
    'backend/.env.example'
  ];

  // Frontend files to copy
  const frontendFiles = [
    'frontend/package.json',
    'frontend/index.html',
    'frontend/src',
    'frontend/public',
    'frontend/.env.example',
    'frontend/vite.config.ts',
    'frontend/tsconfig.json',
    'frontend/tsconfig.node.json',
    'frontend/postcss.config.js',
    'frontend/tailwind.config.js'
  ];

  // Copy backend files
  for (const file of backendFiles) {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(process.cwd(), 'export', file);
    
    try {
      await fs.cp(sourcePath, targetPath, { recursive: true });
    } catch (error) {
      console.error(`Error copying ${file}:`, error);
    }
  }

  // Copy frontend files
  for (const file of frontendFiles) {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(process.cwd(), 'export', file);
    
    try {
      await fs.cp(sourcePath, targetPath, { recursive: true });
    } catch (error) {
      console.error(`Error copying ${file}:`, error);
    }
  }

  // Create README files
  const backendReadme = `# File Manager Backend

A Node.js backend service for file management with authentication and MongoDB.

## Features
- User authentication with email verification
- LinkedIn OAuth integration
- File upload and management
- Public/private file sharing
- Rate limiting and security features

## Setup
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create .env file:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/filemanager
   JWT_SECRET=your_jwt_secret_key_here
   CORS_ORIGIN=http://localhost:5173
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   \`\`\`

3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Documentation
### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/verify-email - Verify email
- POST /api/auth/linkedin - LinkedIn OAuth callback

### Files
- POST /api/files/upload - Upload file
- GET /api/files - Get user's files
- DELETE /api/files/:id - Delete file
- PATCH /api/files/:id/toggle-public - Toggle file public access
`;

  const frontendReadme = `# File Manager Frontend

A React-based frontend for file management with authentication and file sharing.

## Features
- User authentication with email verification
- LinkedIn OAuth integration
- File upload with drag & drop
- File management interface
- Public/private file sharing
- Responsive design

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

## Building for Production
\`\`\`bash
npm run build
\`\`\`

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons
`;

  await fs.writeFile('export/backend/README.md', backendReadme);
  await fs.writeFile('export/frontend/README.md', frontendReadme);

  // Create .env.example files
  const backendEnvExample = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/filemanager
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret`;

  const frontendEnvExample = `VITE_API_URL=http://localhost:5000/api
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id`;

  await fs.writeFile('export/backend/.env.example', backendEnvExample);
  await fs.writeFile('export/frontend/.env.example', frontendEnvExample);

  console.log('Projects exported successfully to export/ directory');
}

exportProjects().catch(console.error);