# Use the official Node.js image as the base image for the backend and frontend build
FROM node:latest AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for backend
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend files to the working directory
COPY . .

# Build the React app for frontend
WORKDIR /app/frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

# Move the built frontend files to the backend public directory
WORKDIR /app

# Expose the port on which your Node.js app runs
EXPOSE 8000

# Start your Node.js app
ENTRYPOINT ["node", "server.js"]
