#!/usr/bin/env bash
# Derivatives from the 1440x1440 master. The animation itself is never
# re-rendered — only the delivery frame changes — so these stay in sync with
# the master by construction.
set -euo pipefail
FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
SRC=out/ptts-praxis-morph-1440.mp4
BG=0xF5E6DF          # --bg, app/globals.css:115

[ -f "$SRC" ] || { echo "master not found: $SRC — run ./render-master.sh first" >&2; exit 1; }

echo "9:16 vertical (1080x1920)…"
# Letterboxed onto the canvas colour rather than cropped: cropping a square
# composition to 9:16 would cut the wide states (the 1247 px chart) in half.
"$FF" -y -hide_banner -loglevel warning -i "$SRC" \
  -vf "scale=1080:1080:flags=lanczos,pad=1080:1920:0:420:color=$BG,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -movflags +faststart \
  out/ptts-praxis-morph-1080x1920.mp4

echo "WebM VP9 (1440x1440)…"
"$FF" -y -hide_banner -loglevel warning -i "$SRC" \
  -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -an \
  out/ptts-praxis-morph-1440.webm

echo "GIF (540x540, 25 fps)…"
# 25 fps divides into GIF's 1/100 s delay field exactly (4 hundredths), so the
# loop keeps its 14.000 s length instead of drifting.
"$FF" -y -hide_banner -loglevel warning -i "$SRC" \
  -vf "fps=25,scale=540:540:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" \
  -update 1 out/palette.png
"$FF" -y -hide_banner -loglevel warning -i "$SRC" -i out/palette.png \
  -lavfi "fps=25,scale=540:540:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4" \
  -loop 0 out/ptts-praxis-morph-540.gif
rm -f out/palette.png

echo
ls -lh out/
