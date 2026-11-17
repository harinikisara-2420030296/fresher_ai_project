FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/feedback-service ./services/feedback-service
WORKDIR /app/services/feedback-service
RUN npm install

EXPOSE 5004

CMD ["node", "index.js"]

