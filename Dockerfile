FROM node:18-alpine

RUN mkdir /src

COPY ./index.js /src
COPY ./package.json /src
COPY ./package-lock.json /src

RUN chown node -R /src

WORKDIR /src

RUN npm ci --omit=dev

CMD [ "npm", "start" ]