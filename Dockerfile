FROM alpine:edge

# hadolint ignore=DL3018
RUN apk update && \
  apk add --no-cache dumb-init && \
  apk add --no-cache curl fontconfig font-noto-cjk && \
  fc-cache -fv && \
  apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn \
  xvfb \
  xauth \
  dbus \
  dbus-x11 \
  x11vnc \
  ffmpeg \
  && \
  apk add --update --no-cache tzdata && \
  cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
  echo "Asia/Tokyo" > /etc/timezone && \
  apk del tzdata

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn
COPY src/ src/
COPY tsconfig.json .

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY template.html .

ENV NODE_ENV production
ENV API_PORT 80
ENV DISPLAY :99
ENV LOG_DIR /data/logs/
ENV CHROMIUM_PATH /usr/bin/chromium-browser

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
