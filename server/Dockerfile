FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for efficient layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend service port
EXPOSE 5001

# Start Express server
CMD ["npm", "start"]
