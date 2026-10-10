ARG BUILD_NUMBER=dev
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

ARG BUILD_NUMBER
RUN echo "Frontend Build: ${BUILD_NUMBER}" > /usr/share/nginx/html/version.txt

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
