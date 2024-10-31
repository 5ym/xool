#!/bin/sh

case "$1" in
  "i")
    cp compose.sample.yml compose.yml
    docker compose run --rm xool i
    docker compose up
    ;;
  "b")
    docker compose exec xool bash
    ;;
  "c")
  docker compose exec xool bun run check
  ;;
  *)
    echo "i b c"
    ;;
esac