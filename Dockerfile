# compiling the project
FROM node:14.19.1 as compiler

WORKDIR /usr/app

COPY package*.json ./

COPY tsconfig*.json ./

RUN npm install

COPY . ./

RUN npm run build


#removing all of the dev dependencies 
# and running prod image
FROM node:14.19.1 as remover

WORKDIR /usr/app

COPY --from=compiler /usr/app/package*.json ./

COPY --from=compiler /usr/app/build ./

RUN npm install --only=production

EXPOSE 3001

CMD [ "node", "./index.js" ] 

