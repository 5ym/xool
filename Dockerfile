FROM oven/bun as base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as builder
ENV NODE_ENV production
COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile
COPY . .
RUN bun run build

FROM base
USER bun
COPY --from=builder --chown=bun:bun /usr/src/app/.next/standalone .
COPY --from=builder --chown=bun:bun /usr/src/app/.next/static .next/static
CMD [ "server.js" ]
