---
layout: post
title: EdgeRouter Lite 
---

As part of a project to build a home lab for testing, I'm upgrading my home network. My first addition is an Ubiquiti [EdgeRouter Lite](https://www.ubnt.com/edgemax/edgerouter-lite/).

![EdgeRouter Lite ERLite-3](/assets/images/posts/2016-02-07-edgerouter/edgerouter-lite-angle.jpg)

I have the ERL connected to my VDSL modem (bridged) on eth0, and to my Netgear AP on eth1. I will be creating a DHCP LAN on each of eth1 and eth2, and setting up a pppoe interface on eth0 to connect to the [Internet](https://www.spark.co.nz/help/internet-email/getstarted/broadband-settings-for-third-party-modems/). Eth1 will be connected to my existing wireless router, and eth2 will be connected to my XBox.

![Diagram](/assets/images/posts/2016-02-07-edgerouter/home-network-v1.png)

Fortunately, after upgrading the firmware to version 1.8 almost all of this can be done using the setup wizard. The only remaining settings I need to adjust are to set up a couple of DHCP reservations and port forwarding rules to keep Plex and Transmission working on my server.

Initial impressions are great. The setup took about an hour, including the time it took to hook everything up and to download and install the firmware update. The router has a console management port for when I inevitably wreck the config or lock myself out of the network, SSH admin console, and the web GUI seems to cover almost all day to day tasks.

The final config looks like [this](https://gist.github.com/tom-henderson/9174ab42588e778b2074).