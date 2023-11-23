FROM oven/bun as base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as builder
ENV NODE_ENV production
COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile
COPY . .
RUN bun run build

FROM node:lts-slim
USER node
COPY --from=builder --chown=node:node /usr/src/app/.next/standalone .
COPY --from=builder --chown=node:node /usr/src/app/.next/static .next/static
CMD [ "server.js" ]
