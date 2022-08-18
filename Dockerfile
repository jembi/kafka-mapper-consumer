FROM node:alpine
ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile

CMD [ "yarn", "start" ]
