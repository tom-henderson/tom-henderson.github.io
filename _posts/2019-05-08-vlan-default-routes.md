---
title: Adding default routes to VLAN interfaces
---

After adding [VLAN interfaces]({% post_url 2019-04-12-ubuntu-vlan-config %}) to my server, I discovered that using the interfaces independently (eg `curl --interface enp1s0.10 example.com`) wouldn't work. Because the default route on the system is via `enp1s0`, the router drops the packet since the gateway for `enp1s0` [has no route back to the source of the packet](https://superuser.com/a/1261116) (at least I *think* that's what's happening ¯\\\_(ツ)_/¯). To make sure packets exit the system from the correct interface we need to add a new route table for each VLAN. We can do this using the `post-up` commands after defining the interfaces in `/etc/network/interfaces`.

An example VLAN interface might look like:

```bash
auto enp1s0.10
iface enp1s0.10 inet static
	vlan-raw-device enp1s0
	address 10.10.0.5
	netmask 255.255.255.0
	post-up ip route add 10.10.0.0/24 dev enp1s0.10 src 10.10.0.5 table 10
	post-up ip route add default via 10.10.0.1 dev enp1s0.10 table 10
	post-up ip rule add from 10.10.0.5/32 table 10
	post-up ip rule add to 10.10.0.5/32 table 10
```

The interface gets its own route table (`table 10` for simplicity I've numbered these to match the VLAN tag). On that table we add a route to the `10.10.0.0/24` network from the `enp1s0.10` with source address `10.10.0.5`, and set the default route via `10.10.0.1`. We then add two rules to use this table for all packets to or from the interface's address.

Once the interface is up we can now use the VLAN interfaces directly.

The new route table can be shown with:

```bash
$ ip route list table 10
default via 10.10.0.1 dev enp1s0.10
10.10.0.0/24 dev enp1s0.10 scope link src 10.10.0.5
```

And the routing rules with:

```bash
$ ip rule list
0:	from all lookup local
32764:	from all to 10.10.0.5 lookup 10
32765:	from 10.10.0.5 lookup 10
32766:	from all lookup main
32767:	from all lookup default
```