FROM node:20-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 8888

# Default run command for development (supports nodemon)
CMD ["npm", "run", "dev"]
