FROM oven/bun as base
WORKDIR /usr/src/app
EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "server.js" ]

FROM base as builder
ENV NODE_ENV production
COPY package.json bun.lockb ./
RUN bun i --frozen-lockfile
COPY . .
RUN bun run build

FROM base as node
ENV NODE_MAJOR 20
RUN apt-get update && apt-get install curl gnupg -y && mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get install nodejs -y

FROM node
USER bun
COPY --from=builder --chown=bun:bun /usr/src/app/.next/standalone .
COPY --from=builder --chown=bun:bun /usr/src/app/.next/static .next/static
