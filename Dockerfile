FROM node:latest

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install -force

COPY . .

ENTRYPOINT ["npm", "run", "dev"]