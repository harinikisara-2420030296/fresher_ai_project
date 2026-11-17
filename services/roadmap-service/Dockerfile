FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/roadmap-service ./services/roadmap-service
WORKDIR /app/services/roadmap-service
RUN npm install

EXPOSE 5005

CMD ["node", "index.js"]

