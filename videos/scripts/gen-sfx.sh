#!/bin/bash
# Synthesizes the subtle UI sound effects used by the MNC reels (no samples,
# no licensing): public/sfx/{click,pop,whoosh,swoosh-soft}.wav
set -euo pipefail
cd "$(dirname "$0")/.."
O=public/sfx; mkdir -p "$O"
A="-ar 48000 -ac 2"
# click: short bright tick
ffmpeg -nostdin -v error -y -f lavfi -i "aevalsrc='0.6*sin(2*PI*2600*t)*exp(-t*140)+0.25*sin(2*PI*5200*t)*exp(-t*220)':d=0.08:s=48000" $A "$O/click.wav"
# pop: soft round blip for cards/pills entering
ffmpeg -nostdin -v error -y -f lavfi -i "aevalsrc='0.7*sin(2*PI*(520+900*exp(-t*40))*t)*exp(-t*28)':d=0.16:s=48000" $A "$O/pop.wav"
# whoosh: band-passed noise swelling in and out
ffmpeg -nostdin -v error -y -f lavfi -i "anoisesrc=d=0.55:c=pink:a=0.9:r=48000" \
  -af "highpass=f=350,lowpass=f=4200,bandpass=f=1400:width_type=o:w=2.2,volume='0.2+1.6*sin(PI*t/0.55)^3':eval=frame,afade=t=in:d=0.18,afade=t=out:st=0.3:d=0.25,volume=2.2" $A "$O/whoosh.wav"
# soft swoosh: shorter, darker, for small transitions
ffmpeg -nostdin -v error -y -f lavfi -i "anoisesrc=d=0.35:c=brown:a=0.9:r=48000" \
  -af "highpass=f=200,lowpass=f=2400,afade=t=in:d=0.12,afade=t=out:st=0.15:d=0.2,volume=2.0" $A "$O/swoosh-soft.wav"
ls -la "$O"
