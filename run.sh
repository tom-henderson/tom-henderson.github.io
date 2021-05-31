#!/bin/bash
docker run --rm -v "$(pwd):/srv" -p 4000:4000 $(DOCKER_SCAN_SUGGEST=false docker build -q .)