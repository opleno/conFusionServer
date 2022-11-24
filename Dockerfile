FROM node:latest

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm", "start"]