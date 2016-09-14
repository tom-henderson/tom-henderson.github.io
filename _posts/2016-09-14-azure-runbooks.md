---
layout: post
title: Azure Automation with Runbooks
---

Running PowerShell scripts against Azure requires a fair bit of setup - we need a windows computer, Azure PowerShell componants, a suitable network to run from etc - and if we need to run them regularly that computer needs to stay online. Fortunately there's a better way.

By adding an Automation Account to a subscription we can upload scripts ('runbooks'), and have them run on a schedule, or connect them to a webhook to allow other systems to trigger them by making an http request. There are also tools to integrate with GitHub so your runbooks are stored safely in version control.

## Updating a dynamic local gateway IP

I keep a VPN up to extend my home network into Azure. Unfortunately since I don't have a static IP on my internet connection, this goes down if the IP changes (unfortunately Azure Local Network Gateways require an IP address, not a DNS name). I have a dynamic DNS name pointing at my home IP, so updating this seems like an ideal task for a runbook. All we need to do is resolve my dynamic DNS name, and if it doesn't match the IP address of the local gateway, update it. Here's the script:

{% gist f7c8a32353635346311eead3996142c9 %}

To get it running in Azure only a few modifications are required.

The Automation Account comes preconfigured with a reasonable set of PowerShell modules, but this script needs AzureRM.Network, which isn't available by default. It can be added under Assets > Modules > Browse Gallery. We also need to add AzureRM.profile, which is a dependency of AzureRM.Network.

To run this manually we would need to use Login-AzureRMAccount to authenticate with Azure, but since this needs to run non-interactively we need another way. When you create the Automation Account a service principal is added to the directory. You can find it at https://manage.windowsazure.com on the Active Directory tab, in your directory under Applications > Applications my Company Owns. 

Back in the Automation Account in the ARM portal, under Assets, we also have two certificates, and two connections for connecting to either the ARM portal or the classic portal using this service principal. To use the connection we just need to add this code to the top of the script: 

{% gist df19e98db60364227ba47956ce09b64c %}

To add the script we go to the runbooks tab in the Automation Account and create a new PowerShell runbook. Paste the script into the editor, click save, then open the test pane from the toolbar to try out the script (which takes longer to run than it would locally because in the background Azure is creating a fresh VM for it to run from each time). Assuming it runs ok we can publish it, and then create a schedule to run the script.

I now have this running hourly so if my home IP changes the VPN will come back up automatically the next time it runs.

{% highlight powershell %}
$connectionName = "AzureRunAsConnection"
try {
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName         

    Add-AzureRmAccount `
        -ServicePrincipal `
        -TenantId $servicePrincipalConnection.TenantId `
        -ApplicationId $servicePrincipalConnection.ApplicationId `
        -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint 
} catch {
    if (!$servicePrincipalConnection) {
        $ErrorMessage = "Connection $connectionName not found."
        throw $ErrorMessage
    } else {
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}

$resourceGroup    = 'RG-Network'
$localGatewayName = 'GW-Local'
$hostName = 'host.example.com'
$localGatewayIP   = [system.net.dns]::GetHostByName($hostName).AddressList.IPAddressToString

Write-Output "Checking IP address of $localGatewayName"

$localGateway = Get-AzureRmLocalNetworkGateway -Name $localGatewayName -ResourceGroupName $resourceGroup
$localAddressSpace = $localGateway.AddressSpaceText | ConvertFrom-Json

if ($localGateway.GatewayIpAddress -ne $localGatewayIP) {
    Write-Output "Gateway IP is $($localGateway.GatewayIpAddress), should be $localGatewayIP"
    $localGateway.GatewayIpAddress = $localGatewayIP
    try {
        Set-AzureRmLocalNetworkGateway -LocalNetworkGateway $localGateway -AddressPrefix @($localAddressSpace.AddressPrefixes)
    } catch {
        Write-Error "Failed to change $localGatewayName gateway IP address to $localGatewayIP"
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
} else {
    Write-Output "Gateway IP is correct: $localGatewayIP"
}
{% endhighlight %}