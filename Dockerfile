ARG NODE_VERSION=12
ARG NGINX_VERSION=1.19.4

#         build
# -------------------------
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package-lock.json ./
COPY ./bin/package-build.js ./bin/

# Build a package.json from the lockfile
RUN ./bin/package-build.js

RUN npm ci --production
COPY . .
RUN npm run build

#          release
# -------------------------
FROM nginx:${NGINX_VERSION} as release
COPY --from=build /app/build /usr/share/nginx/html
