FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY ws-proxy.js ./
EXPOSE 8080
ENV PORT=8080
CMD ["node", "ws-proxy.js"]
