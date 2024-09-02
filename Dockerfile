FROM node:20-alpine
WORKDIR /home/node/app
RUN apk add --update --no-cache make
RUN apk add --no-cache python3 py3-pip
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
CMD [ "node", "index.js" ]