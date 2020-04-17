FROM ruby:alpine

RUN apk --no-cache --update add \
    build-base \ 
    npm

RUN gem install \
    github-pages

WORKDIR /srv

CMD ["jekyll", "serve", "-H", "0.0.0.0"]