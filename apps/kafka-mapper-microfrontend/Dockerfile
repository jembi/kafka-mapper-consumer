FROM node:20-alpine as build
WORKDIR /usr/app
COPY apps/kafka-mapper-microfrontend/ .

RUN npm install

RUN npm run build

FROM nginx:1.23.1-alpine
EXPOSE 80
COPY --from=build /usr/app/config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/dist /usr/share/nginx/html
