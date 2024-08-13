FROM ruby:3.3.4-bookworm

WORKDIR /srv
COPY Gemfile .
RUN bundle install

CMD ["jekyll", "serve", "-H", "0.0.0.0"]