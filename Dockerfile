FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_STORE_MANAGER_ROLE_ID
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STORE_MANAGER_ROLE_ID=$VITE_STORE_MANAGER_ROLE_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
