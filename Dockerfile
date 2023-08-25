FROM node:lts-slim as base
WORKDIR /usr/src/app
ENV NODE_ENV production

FROM base as builder
RUN npm i -g bun
COPY package.json bun.lockb ./
RUN bun i
COPY . .
RUN bun run build

FROM base
USER node
COPY --from=builder --chown=node:node /usr/src/app/.next/standalone .
COPY --from=builder --chown=node:node /usr/src/app/.next/static .next/static
EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "server.js" ]