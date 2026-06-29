FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build CSS
RUN npm run build:css

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
