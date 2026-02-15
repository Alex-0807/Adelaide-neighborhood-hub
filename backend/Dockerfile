# -----------------------------
# 1. Base image for building
# -----------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Install only production deps first (layer caching optimization)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy the entire project (TS source, Prisma schema)
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript → JavaScript
RUN npm run build



# -----------------------------
# 2. Final production image
# -----------------------------
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Only copy necessary files for production
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Expose the port that your backend listens on
EXPOSE 3001

# Start backend
CMD ["npm", "run", "dev"]