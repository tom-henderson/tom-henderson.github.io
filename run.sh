#!/bin/bash
docker build -t jekyll .
docker run --rm -v "$(pwd):/srv" -p 4000:4000 jekyll