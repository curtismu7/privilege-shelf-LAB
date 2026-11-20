# Local Docker form (OrbStack). Mock only: no tenant, no credentials, no outbound calls.
# The server has no runtime dependencies: Vite is only needed to build the page.
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production \
    BIND_HOST=0.0.0.0 \
    PORT=7828 \
    DATA_ROOT=/tmp/privilege-shelf-data
COPY package.json server.js ./
COPY lib ./lib
COPY content ./content
COPY docs/talk-track.md ./docs/talk-track.md
COPY --from=build /app/dist ./dist
USER node
EXPOSE 7828
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:7828/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
