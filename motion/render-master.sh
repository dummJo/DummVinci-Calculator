#!/usr/bin/env bash
# Full render: 4 subframes per output frame, blended with ffmpeg tmix for
# motion blur, encoded at 60 fps. Nothing large touches disk — Playwright pipes
# PNGs straight into ffmpeg, which is what keeps this inside the session's
# fixed disk allowance.
set -euo pipefail
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
FPS=60; SUB=4
node capture.mjs full $FPS $SUB \
  | "$FF" -y -hide_banner -loglevel warning \
      -f image2pipe -framerate $((FPS*SUB)) -i - \
      -vf "tmix=frames=$SUB:weights='1 1 1 1',fps=$FPS,format=yuv420p" \
      -c:v libx264 -preset slow -crf 16 -movflags +faststart \
      out/ptts-praxis-morph-1440.mp4
