---
title: EdgeRouter PPTP VPN with Dynamic IP Address
---

# Dynamic DNS
Setting up VPN remote access on the EdgeRouter is a pretty straightforward, but without a static IP address we won't be able to connect back home if the external IP changes. To get around this we can use a dynamic DNS provider like [noip.com](http://www.noip.com/) and have the EdgeRouter update the IP if it changes. After setting up an account and a new dynamic hostname, we can configure the router with:

{% gist 118de8434b113adb9d03 %}

# Configure VPN
Now that we have a DNS name we can set up the PPTP VPN.

{% gist 845b12bfc51b5a22f801 %}

First we enable the PPTP VPN using local authentication. This handy because I don't yet have a RADIUS server to use for authentication. We specify an address pool to hand out to VPN clients, and a DNS server for them to use. 

Since I'm using the router as my DNS server I also need to listen for DNS forwarding on that IP, otherwise it won't respond to DNS requests from the VPN client IP pool.

Finally we need to set up firewall rules that wil allow the PPTP and GRE traffic to reach the router.