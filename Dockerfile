FROM node:alpine

WORKDIR /app

COPY . .
RUN apk --update add --no-cache alpine-sdk autoconf libtool automake python3
RUN npm install
RUN npm run build
CMD [ "node", "dist/index.js" ]