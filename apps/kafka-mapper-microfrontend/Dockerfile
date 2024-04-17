FROM node:16.17.1-alpine3.16 as build
WORKDIR /usr/app
COPY . /usr/app
RUN npm install

RUN npm run build

RUN ls -alh /usr/app/dist

FROM nginx:1.23.1-alpine
EXPOSE 80
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/dist /usr/share/nginx/html
