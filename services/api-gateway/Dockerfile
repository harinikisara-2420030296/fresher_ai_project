FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/api-gateway ./services/api-gateway
WORKDIR /app/services/api-gateway
RUN npm install

EXPOSE 5000

CMD ["node", "index.js"]

