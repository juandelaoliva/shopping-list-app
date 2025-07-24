# ---- Etapa 1: Build ----
# Usa una imagen completa de Node para construir la aplicación
FROM node:18-alpine AS build

WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala todas las dependencias (incluidas las de desarrollo)
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación para producción
RUN npm run build

# ---- Etapa 2: Production ----
# Usa una imagen de Node súper ligera para servir los archivos
FROM node:18-alpine

WORKDIR /app

# Copia las dependencias de producción construidas en la etapa anterior
COPY --from=build /app/package.json ./package.json
RUN npm install --only=production

# Copia la carpeta 'build' de la etapa anterior
COPY --from=build /app/build ./build

# Instala 'serve' para servir los archivos estáticos
RUN npm install -g serve

# Expone el puerto que usará 'serve'
EXPOSE 3000

# El comando para iniciar el servidor de producción
CMD ["serve", "-s", "build"]