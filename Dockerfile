FROM node:lts-slim as builder
WORKDIR /usr/src/app
ENV NODE_ENV production
RUN npm i -g npm && npm i -g bun
COPY package.json bun.lockb ./
RUN bun i
COPY . .
RUN bun run build

FROM node:lts-slim
WORKDIR /usr/src/app
ENV NODE_ENV production
RUN npm i -g npm && npm i -g bun
USER node
COPY --from=builder --chown=node:node /usr/src/app/.next .next
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/package.json .
EXPOSE 3000
ENTRYPOINT [ "bun" ]
CMD [ "start" ]