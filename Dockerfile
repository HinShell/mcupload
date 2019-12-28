FROM nginx:1.16-alpine
COPY source/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
