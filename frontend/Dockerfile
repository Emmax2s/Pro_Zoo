# ── Frontend React/Vite ───────────────────────────────────
# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL
ARG VITE_CHATBOT_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CHATBOT_URL=$VITE_CHATBOT_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
