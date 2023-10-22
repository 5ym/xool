#!/bin/sh

case "$1" in
  "i")
    cp compose.sample.yml compose.yml
    docker compose run --rm tweel i
    docker compose up
    ;;
  *)
    echo "i";;
esac