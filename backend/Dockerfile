# Backend Dockerfile - Node/Express + Prisma (dev-friendly)
FROM node:20-alpine

# Install OS deps if needed (openssl for Prisma on alpine is included)
WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source
COPY tsconfig*.json ./
COPY src ./src

EXPOSE 3001

# Default to dev server for hot-reload; overridden by docker-compose if needed
CMD ["npm", "run", "dev"]
