FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/user-service ./services/user-service
WORKDIR /app/services/user-service
RUN npm install

EXPOSE 5001

CMD ["node", "index.js"]

