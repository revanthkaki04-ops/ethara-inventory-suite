# Stage 1: Build static assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Inject default or build-time environment variable for VITE_API_URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine

# Copy built bundle from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
