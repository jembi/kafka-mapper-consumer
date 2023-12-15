# build environment
FROM node:20-alpine as build
WORKDIR /kafka-mapper-consumer-ui
ENV PATH /kafka-mapper-consumer-ui/node_modules/.bin:$PATH
COPY package.json /kafka-mapper-consumer-ui/package.json
RUN yarn install
COPY . /kafka-mapper-consumer-ui

RUN rm -v /kafka-mapper-consumer-ui/.env
COPY .env.docker /kafka-mapper-consumer-ui/.env
ENV REACT_APP_API_URL http://localhost:8080
ENV REACT_APP_API_ENDPOINT /apps
RUN yarn run build

# production environment
FROM nginx:20-alpine

RUN rm -v /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/
COPY --from=build /kafka-mapper-consumer-ui/release /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
