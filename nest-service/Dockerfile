# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and tsconfig files
COPY package.json tsconfig.docker.json ./

# Install all dependencies including dev dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application with standalone tsconfig
RUN npx nest build -p tsconfig.docker.json

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files and package files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 8001

CMD ["node", "dist/main.js"] 