---
layout: post
title: Site to Site VPN into Azure with EdgeRouter
comments: true
---

These scripts are based on the instructions in the [Azure Documentation](https://azure.microsoft.com/en-us/documentation/articles/vpn-gateway-create-site-to-site-rm-powershell/).

The first step is to set up the Azure side. [This script](https://gist.github.com/tom-henderson/7468f5bc1b5d90305dd7f120200a6088#file-azure-vpn-ps1) can be run from any machine with the [AzureRM PowerShell modules](https://azure.microsoft.com/en-us/documentation/articles/powershell-install-configure/) installed. Be sure to read it through and update the variables at the top before you run it.

First we need a resource group to put the Azure objects in, into which we create a new Virtual Network, and create two subnets inside. The first subnet "GatewaySubnet" is important, and must be named exactly that in order to work correctly. The other subnet ("AzureSubnet") is where we will be attaching our VMs, and can be named anything you like. You can add additional subnets to the Virtual Network later to organise your Azure network.

To represent the local side of the network we create a local network gateway. This is configures with our external IP address, and details of the address space we use internally.

Next we need to request a public IP address, get a reference to our GatewaySubnet, and use these to create a new Virtual Network Gateway IP Config. This is then used to create the Virtual Network Gateway. This step can take up to 20 mins to return a reference to the created object.

The last step is to create a Virtual Network Gateway Connection to link the Virtual Network Gateway with the Local Network Gateway, and configure it to use IPSec and a pre shared key.

With Azure configured, we just need to tell the EdgeRouter to connect. These settings work for me, but may not be optimal. Make sure you set the right interface on line 1. Mine is a pppoe interface, but yours may be different.

{% gist c32eed662edb5eaa034f6f9a0ae7fb7f %}

To get the public IP address of your new Azure Virtual Nerwork Gateway, you can use:

{% highlight powershell %}
$remoteGatewayIP = Get-AzureRmPublicIpAddress -Name $remoteGatewayIPAddressName -ResourceGroupName $resourceGroup
Write-Host $remoteGatewayIP.IpAddress
{% endhighlight %}

If you need to add additional VPNs - perhaps to a second subscription - set up the Azure side, and create a new site-to-site-peer on the EdgeRouter. You can reuse the same esp-group and ike-group.

After saving the configuration you should be able to see the active connection in the EdgeRouter CLI with `show vpn ipsec status`, which should return something like:

{% highlight bash %}
IPSec Process Running PID: 1703

1 Active IPsec Tunnels

IPsec Interfaces :
        pppoe0  (123.123.123.123)
{% endhighlight %}

With the VPN up we can now build Azure VMs in the AzureSubnet of our Virtual Network without creating a public IP for each one.