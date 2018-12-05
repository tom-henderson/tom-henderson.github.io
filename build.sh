#!/bin/bash

npm install

cp ./node_modules/jquery/dist/jquery.min.js ./assets/js/jquery.min.js
cp ./node_modules/vanilla-fitvids/jquery.fitvids.js ./assets/js/jquery.fitvids.js

rm -rf ./assets/fonts/*
cp ./node_modules/font-awesome/css/font-awesome.min.css ./assets/css/font-awesome.min.css
cp -r ./node_modules/font-awesome/fonts/ ./assets/fonts/

rm -rf ./_sass/bourbon/*
cp -r ./node_modules/bourbon/core/ ./_sass/bourbon/

rm -rf ./node_modules