---
title: Adding VLAN Interfaces to Ubuntu
tags: 
 - networking
---

I'm in the process of rebuilding my home network, splitting the network into separate VLANs. My Ubuntu server is connected to a trunk port on my switch, and I need to create virtual interfaces to allow it to access all of the VLANs I've set up. It turns out this is fairly straightforward.

First we install the `vlan` and add the `8021q` kernel module.

```bash
sudo apt-get install vlan
sudo modprobe 8021q
```

Next we can create the virtual interfaces, in my case they will share the `enp1s0` interface:

```bash
sudo vconfig add enp1s0 10
sudo vconfig add enp1s0 20
sudo vconfig add enp1s0 30
sudo vconfig add enp1s0 40
```

Since I'm using DHCP for everything I set up `/etc/network/interfaces` as follows. You could alternatively set your virtual interfaces as `static` and manually configure the IP, netmask, gateway etc.

```bash
# This file describes the network interfaces available on your system
# and how to activate them. For more information, see interfaces(5).

source /etc/network/interfaces.d/*

# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto enp1s0
iface enp1s0 inet dhcp

auto enp1s0.10
iface enp1s0.10 inet dhcp
	vlan-raw-device enp1s0

auto enp1s0.20
iface enp1s0.20 inet dhcp
	vlan-raw-device enp1s0

auto enp1s0.30
iface enp1s0.30 inet dhcp
	vlan-raw-device enp1s0

auto enp1s0.40
iface enp1s0.40 inet dhcp
	vlan-raw-device enp1s0
```

We can now bring these interfaces up, and they should be reachable from their respective VLANs:

```bash
sudo ifup enp1s0.10
sudo ifup enp1s0.20
sudo ifup enp1s0.30
sudo ifup enp1s0.40
```

One issue I ran into was that I couldn't access the virtual interfaces from other VLANs. For example a client on `VLAN10` could ping this server on it's `VLAN10` address, but not on `VLAN20`. To get around this we need to change the [Reverse Path Filtering](https://www.theurbanpenguin.com/rp_filter-and-lpic-3-linux-security/) setting in `/etc/sysctl.d/10-network-security.conf`. 

> The 3 values that can be set for the key rp_filter are:  
0: No source address validation is performed and any packet is forwarded to the destination network  
1: Strict Mode as defined in RFC 3074. Each incoming packet to a router is tested against the routing table and if the interface that the packet is received on is not the best return path for the packet then the packet is dropped.  
2: Loose mode as defines in RFC 3074 Loose Reverse Path. Each incoming packet is tested against the route table and the packet is dropped if the source address is not routable through any interface. The allows for asymmetric routing where the return path may not be the same as the source path

In my case I want incoming packets on the VLAN interfaces to be able to route to other VLANS, so we can set this to 2. 

```bash
# Turn on Source Address Verification in all interfaces to
# prevent some spoofing attacks.
net.ipv4.conf.default.rp_filter=1
net.ipv4.conf.all.rp_filter=1
net.ipv4.conf.enp1s0.rp_filter=2
net.ipv4.conf.enp1s0/10.rp_filter=2
net.ipv4.conf.enp1s0/20.rp_filter=2
net.ipv4.conf.enp1s0/30.rp_filter=2
net.ipv4.conf.enp1s0/40.rp_filter=2

# Turn on SYN-flood protections.  Starting with 2.6.26, there is no loss
# of TCP functionality/features under normal conditions.  When flood
# protections kick in under high unanswered-SYN load, the system
# should remain more stable, with a trade off of some loss of TCP
# functionality/features (e.g. TCP Window scaling).
net.ipv4.tcp_syncookies=1
```

After restarting the networking service `sudo service networking restart` the server is now reachable on all interfaces.