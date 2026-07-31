FROM oven/bun:1.3.14-slim AS base
WORKDIR /usr/src/app
EXPOSE 3000
ENV BODY_SIZE_LIMIT=100M

FROM base AS builder
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun i --frozen-lockfile
COPY . .
# Declared after the source copy so it can't invalidate the dependency layers.
# Stamps the build into version.json, which open tabs poll to spot a rollout.
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION
RUN bun run build

FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun i --frozen-lockfile --production

FROM base
RUN mkdir -p data images && chown bun:bun data images
USER bun
COPY --from=prod-deps --chown=bun:bun /usr/src/app/node_modules ./node_modules
COPY --from=builder   --chown=bun:bun /usr/src/app/package.json ./package.json
COPY --from=builder   --chown=bun:bun /usr/src/app/build ./build
COPY --from=builder   --chown=bun:bun /usr/src/app/assets ./assets
CMD [ "build/index.js" ]
