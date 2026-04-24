# =============================================
# DigiLib Frontend - Dockerfile
# React 19 + Vite + TailwindCSS
# =============================================

FROM node:22-alpine AS builder

WORKDIR /app

# Cài dependencies trước (tận dụng cache layer)
COPY package.json package-lock.json ./
RUN npm install

# Copy source rồi build production
COPY . .
RUN npm run build

# ---- Production stage: serve bằng nginx ----
FROM nginx:alpine

# Copy static build output từ stage trước
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx để React Router hoạt động đúng (SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
