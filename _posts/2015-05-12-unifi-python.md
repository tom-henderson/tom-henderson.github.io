---
title: Authenticate Unifi WiFi Guests with Python
tags: 
 - unifi
 - django
 - python
---

Unifi WiFi can be configured to use a custom portal for the Guest network. As part of a large rollout of Ubiquiti access points, I built a custom guest portal in Django that would allow us to customise the appearance of the guest authentication page to match the brand of each of our locations.

![Guest Portal Configuration](/assets/images/posts/unifi-custom-portal-config.png)
![Custom Branded Guest Portal](/assets/images/posts/unifi-custom-portal.png)

When an unauthenticated guest connects to a wireless network with the guest policy enabled, http requests are redirected to the custom portal. When the form is submitted, Django validates the password, and then uses the Unifi API to authorize the guest's MAC address.

{% gist 3ac2e2ce05e4f5e77c2b %}