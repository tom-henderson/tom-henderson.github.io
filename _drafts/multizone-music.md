---
layout: post
title: Building a minimal multizone music player
header: music.jpg
---

Accessing a single output on a card directly blocks other processes from accessing other outputs. The key to playing multiple zones independently is to create new 'plug' outputs in asound.conf. Each of these outputs can be accessed by a separate process, and the audio is passed on to the soundcard. The result is 3 zones on a 5.1 card (plus an extra zone for the built in audio), each playing 