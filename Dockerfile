FROM node:21.4.0-alpine3.19

WORKDIR /app

COPY ./src ./src
COPY .env.production .
COPY ecosystem.config.js .
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN apk add python3
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 4000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]