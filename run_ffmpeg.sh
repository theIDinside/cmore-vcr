#!/bin/bash

# Due to the output from Firefox being so flakey, _or_ due to Linux's atrocious codecs management
# we run all files through ffmpeg

suffix=".webm"

for segment in $1/*.webm; do
  ffmpeg -i $1/$segment -strict -2 ${segment/%$suffix}.mp4
done
