# Frontend Dockerfile - Vite React (dev-friendly)
FROM node:20-alpine

WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest
COPY tsconfig*.json ./
COPY index.html ./
COPY public ./public
COPY src ./src

EXPOSE 5173

# Run Vite dev server accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
