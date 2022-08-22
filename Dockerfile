FROM node:alpine

WORKDIR /app

COPY . .
RUN apk add --no-cache libtool
RUN npm install
RUN npm run build
CMD [ "node", "dist/index.js" ]