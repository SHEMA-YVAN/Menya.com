# MENYA — single-container build (website + API together).
# Works on Railway, Fly.io, a VPS, Google Cloud Run, etc.

FROM node:20-slim AS build
WORKDIR /app

# Install frontend deps and build the Vue app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Install backend deps
RUN npm --prefix server install --omit=dev

# ---- runtime image ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy everything needed to run (built client + server + node_modules)
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/package*.json ./

# Persistent data location (mount a volume here in production)
ENV DB_PATH=/data/data.db
ENV UPLOAD_DIR=/data/uploads
ENV PORT=4000
VOLUME ["/data"]

EXPOSE 4000
CMD ["node", "server/src/index.js"]
