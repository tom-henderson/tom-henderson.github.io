---
title: EdgeRouter L2TP Remote Access VPN
---

With the release of iOS10 and macOS Sierra, [Apple has removed PPTP](https://support.apple.com/en-nz/HT206844) as a supported VPN connection. Previously [I had set up a PPTP VPN]({% post_url 2016-06-30-edgerouter-vpn %}) for remote access to my home network, so to keep this working I needed to switch to another type of VPN. iOS supports L2TP, IKEv2 and IPSec, and of these the EdgeRouter only supports L2TP as a remote access VPN.

The setup is fairly straightforward, and very similar to the PPTP configuration. The only real difference is the need for a pre-shared secret in the IPSec settings, and firewall rules on WAN_LOCAL to allow  IKE, L2TP, ESP and optionally NAT-T.

The EdgeRouter also requires that we define either an outside IP address to listen on, or a DHCP interface to listen on. My pppoe interface has a dynamic IP, but doesn't use DHCP, so the simplest option seems to be to use 0.0.0.0 as the outside interface. I assume this means that all interfaces are listening, but in practice only the pppoe interface will have the required firewall rules to allow a connection.

I ended up with this config with seems to work perfectly.

{% gist 2ed3c89ec1dabe8ad7bdc62a04801ace %}

Note that my previous configuration had already set ``set service dns forwarding options "listen-address=10.0.0.1"``, which is probably also required here. 
