FROM node:lts-slim as base
WORKDIR /usr/src/app
ENV NODE_ENV production
RUN npm i -g bun

FROM base as builder
COPY package.json bun.lockb ./
RUN bun i
COPY . .
RUN bun run build

FROM base
USER node
COPY --from=builder --chown=node:node /usr/src/app/.next .next
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/package.json .
EXPOSE 3000
ENTRYPOINT [ "bun" ]
CMD [ "start" ]