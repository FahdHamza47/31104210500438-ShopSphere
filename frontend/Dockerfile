FROM node:20-slim AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_ASSET_URL=http://localhost:5000
ARG VITE_REVIEW_SERVICE_URL=http://localhost:5001/api
ENV VITE_REVIEW_SERVICE_URL=$VITE_REVIEW_SERVICE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ASSET_URL=$VITE_ASSET_URL

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

EXPOSE 8080

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]