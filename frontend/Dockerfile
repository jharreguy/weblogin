# ── Build stage ──────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# ── Nginx stage ───────────────────────────────────────
FROM nginx:alpine AS runtime

# Copiar el build de Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar config de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
