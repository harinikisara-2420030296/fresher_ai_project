FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/interview-service ./services/interview-service
WORKDIR /app/services/interview-service
RUN npm install

EXPOSE 5003

CMD ["node", "index.js"]

