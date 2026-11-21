#!/bin/sh

cleanup() {
    kill "$XVFB_PID" "$X11VNC_PID" 2>/dev/null || true
    wait "$XVFB_PID" "$X11VNC_PID" 2>/dev/null || true
}
trap cleanup EXIT

rm /tmp/.X*-lock || true

Xvfb :99 -ac -screen 0 600x1000x16 -listen tcp &
XVFB_PID=$!
x11vnc -rfbport 5910 -shared -forever -noxdamage -display :99 -nopw -loop -xkb &
X11VNC_PID=$!

rm -rf /data/userdata/Singleton* || true

yarn build
