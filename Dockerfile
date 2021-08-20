#Contem as informações que terei no container docker

FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

#Dar uma conferida aqui:
CMD ["npm","run","app"] 

