FROM node:17-alpine3.14

COPY . /app

RUN cd /app && npm install

WORKDIR "/app"

CMD [ "node", "bot.js" ]
