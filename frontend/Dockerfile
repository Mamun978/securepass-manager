FROM node:22-alpine AS build
WORKDIR /app
ARG API_URL=http://localhost:8080/api
ENV API_URL=$API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
