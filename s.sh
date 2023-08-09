#!/bin/sh

case "$1" in
  "i")
    cp docker-compose-sample.yml docker-compose.yml
    docker compose run --rm tweel sh -c 'bun i && bun run build'
    docker compose up
    ;;
  *)
    echo "i";;
esac