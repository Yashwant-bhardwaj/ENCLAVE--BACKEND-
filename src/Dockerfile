FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 5173

# Default run command for Vite dev server
CMD ["npm", "run", "dev"]