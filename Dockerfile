FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=10000
COPY . .
EXPOSE 10000
CMD ["node", "server.js"]
