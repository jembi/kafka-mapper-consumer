FROM node:20-alpine AS base
ENV NODE_ENV=production

WORKDIR /app

COPY apps/kafka-mapper-consumer/ .

RUN yarn --production --frozen-lockfile

ENTRYPOINT [ "yarn", "start" ]
