FROM node:20-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
EXPOSE 5000
CMD ["./wait-for-it.sh", "db:5432", "--timeout=30", "--strict", "--", "npm", "start"]
