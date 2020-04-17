#!/bin/bash
docker run --rm -v "$(pwd):/srv" -p 4000:4000 $(docker build -q .)