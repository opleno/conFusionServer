FROM node:latest

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY . .

ENTRYPOINT ["npm", "run", "dev"]