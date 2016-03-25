---
layout: post
title: Accessing bridged modem through EdgeRouter
---

I needed a small tweak to my EdgeRouter config to let me connect to my [bridged VDSL modem](https://www.spark.co.nz/help/internet-data/equipment/huawei/hg630b-gateway/setup-bridge-mode-huawei-hg630b/). The EdgeRouter is connected to the modem on eth0.

The modem uses `192.168.1.254/24` by default, so the first step is to give eth0 an IP on the same network. Then we need a NAT masquerade rule to NAT traffic for the `192.168.1.0/24` network through eth0. 

After applying the changes I can now browse to the admin interface of the modem.

{% gist ba38a40ed0b15ae4a702 %}
