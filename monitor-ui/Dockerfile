FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./

# Install pnpm with specific version
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM nginx:stable-alpine

# Copy build from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 