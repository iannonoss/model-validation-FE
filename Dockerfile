# Fase 1: Build app Angular
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Fase 2: Serve con NGINX
FROM nginx:alpine

# Copia i file generati da Angular nella cartella pubblica di nginx
COPY --from=build /app/dist/model-validation-fe/browser /usr/share/nginx/html

# Espone la porta su cui gira nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
