# Stage 1: Build React SPA static production bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy client source code and build production assets into /app/dist
COPY . .
RUN npm run build

# Stage 2: Serve compiled assets with lightweight Nginx
FROM nginx:alpine

# Clean default Nginx site files
RUN rm -rf /usr/share/nginx/html/*

# Copy production assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx reverse proxy and SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
