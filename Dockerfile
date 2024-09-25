FROM ruby:3.3.4-bookworm

WORKDIR /srv
COPY Gemfile .
COPY Gemfile.lock .
RUN bundle install

CMD ["jekyll", "serve", "-H", "0.0.0.0"]