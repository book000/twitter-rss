FROM zenika/alpine-chrome:with-puppeteer-xvfb as runner

# hadolint ignore=DL3002
USER root

# hadolint ignore=DL3018
RUN apk upgrade --no-cache --available && \
  apk update && \
  apk add --no-cache \
  x11vnc \
  && \
  apk add --update --no-cache tzdata && \
  cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  echo "Asia/Tokyo" > /etc/timezone && \
  apk del tzdata

WORKDIR /app

COPY package.json yarn.lock ./

RUN echo network-timeout 600000 > .yarnrc && \
  yarn install --frozen-lockfile && \
  yarn cache clean

COPY src/ src/
COPY tsconfig.json .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY template.html .

ENV NODE_ENV production
ENV TZ Asia/Tokyo
ENV DISPLAY :99
ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV API_PORT 80
ENV DEBUG_OUTPUT_RESPONSE true
ENV SEARCH_WORD_PATH /data/searches.json
ENV LOG_DIR /data/logs/
ENV USER_DATA_DIRECTORY /data/userdata/
ENV DEBUG_RESPONSE_DIRECTORY /data/responses/

ENTRYPOINT ["tini", "--"]
CMD ["/app/entrypoint.sh"]