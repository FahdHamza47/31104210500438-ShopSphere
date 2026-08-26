FROM node:20-slim AS builder

WORKDIR /app

ARG VITE_API_URL=https://31104210500438-shopsphere-backend-three.vercel.app/api
ARG VITE_ASSET_URL=https://31104210500438-shopsphere-backend-three.vercel.app
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