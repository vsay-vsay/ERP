# Stage 1: Install development dependencies
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm install --force

# Stage 2: Install production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm install --force --omit=dev

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY . .

# Final Stage: Production image
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy application files from build stage
COPY --from=build-env /app .

# Environment variables (will be set at runtime)
# In your Final Stage: Production image section
ARG PORT
ARG MONGO_URI
ARG JWT_SECRET
ENV PORT=$PORT \
    MONGO_URI=$MONGO_URI \
    JWT_SECRET=$JWT_SECRET
# Increase file watcher limit for Node.js
RUN echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf

# Expose port (default to 5004 but can be overridden)
EXPOSE ${PORT:-5004}

# Start command
CMD ["node", "server.js"]
