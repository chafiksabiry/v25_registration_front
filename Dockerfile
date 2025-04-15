# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

ENV VITE_OPENAI_API_KEY=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
ENV VITE_LINKEDIN_CLIENT_ID=78dci2o5ppds4v
ENV VITE_LINKEDIN_CLIENT_SECRET=WPL_AP1.T45rXV4XwyxtS5pl.cTa72w
#ENV VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/linkedin-callback
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibXVzZXJua2tzYm54aHZzZ294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNTg4NDMsImV4cCI6MjA1MjYzNDg0M30.EtRoTBjDoEOmYvDKVfgKjcXN2mUcxkpFucEOAnEpl78
ENV VITE_SUPABASE_URL=https://ubmusernkksbnxhvsgox.supabase.co
#dev
#ENV VITE_API_URL=http://localhost:5000/api
#preprod
ENV VITE_API_URL=https://preprod-api-registration.harx.ai/api

#aws
ENV VITE_AWS_REGION=eu-west-3
ENV VITE_AWS_ACCESS_KEY_ID=AKIAWODTAOGLI4ZJPWA7
ENV VITE_AWS_SECRET_ACCESS_KEY=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
ENV VITE_AWS_SES_FROM_EMAIL=chafik.sabiry@harx.ai
# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# Install a lightweight HTTP server to serve the build
RUN npm install -g serve

# Expose the port for the HTTP server
EXPOSE 5157

# Command to serve the app
CMD ["serve", "-s", "dist", "-l", "5157"]