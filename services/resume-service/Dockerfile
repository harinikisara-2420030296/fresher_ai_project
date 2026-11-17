FROM node:20-alpine

WORKDIR /app

COPY packages/shared ./packages/shared
RUN cd packages/shared && npm install

COPY services/resume-service ./services/resume-service
WORKDIR /app/services/resume-service
RUN npm install

EXPOSE 5002

CMD ["node", "index.js"]

