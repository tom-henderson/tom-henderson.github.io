---
layout: post
title: Restoring a Failed 1TB Hard Drive with Backblaze
image: /assets/headers/aziz-acharki-285336-unsplash.jpg
---

I was recently unlucky enough to discover one of the external drives attached to my Plex server had failed. The drive actually appeared fine in Finder - the way I found out was a warning email from Backblaze explaining that the drive hadn't been connected for 14 days. If I'd been watching more TV I might have noticed the issue earlier. I have this machine backed up to Backblaze, and since we have a pretty decent fiber connection I assumed it wouldn't be too much of an issue to just download the backup.

The first issue I ran into was the interface for [restoring files from external drives that are no longer attached](https://help.backblaze.com/hc/en-us/articles/217665878-Restoring-Data-from-Secondary-or-External-Hard-Drives). When a drive is disconnected, it seems Backblaze treats the files as deleted. Since the notification of the disconnected drive too 2 weeks, this means the granularity available for restore is reduced fairly significantly. This wasn't a concern for me in this case, but it's worth being aware of.

![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/observium.png)
![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/downloader-activity-monitor.png)
![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/downloading.png)
![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/downloading2.png)

Header photo by [Aziz Acharki](https://unsplash.com/photos/7IlaJn7GTFE) on Unsplash