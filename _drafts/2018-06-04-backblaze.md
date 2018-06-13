---
layout: post
title: Restoring a Failed Hard Drive from Backblaze
image: /assets/headers/aziz-acharki-285336-unsplash.jpg
---

I was recently unlucky enough to discover one of the external drives attached to my Plex server had failed. The drive actually appeared ok in Finder - the way I found out was actually a warning email from Backblaze explaining that the drive hadn't been connected for 14 days. If I'd been watching more TV I might have noticed the issue earlier. I have this machine backed up to Backblaze, and since we have a pretty decent fiber connection I assumed it wouldn't be too much of an issue to just download the backup.

The first issue I ran into was the interface for [restoring files from external drives that are no longer attached](https://help.backblaze.com/hc/en-us/articles/217665878-Restoring-Data-from-Secondary-or-External-Hard-Drives). When a drive is disconnected, it seems Backblaze treats the files as deleted. Since the notification of the disconnected drive too 2 weeks, this means the granularity available for restore is reduced fairly significantly. This wasn't a concern for me in this case, but it's worth being aware of. Of greater concern for me was that I'd now wasted half of the 4 weeks retention - still plenty of time to download the files, but I didn't want to cut it too fine.

I decided to split my restore into two downloads. Once Backblaze was done zipping up the download I ended up with one about 250GB and one around 500GB.

I installed the [Backblaze Downloader](https://www.backblaze.com/blog/restore-downloader-apps-available/), and set it to restore the smaller file using 10 threads. The result was pretty impressive, maintaining over 70Mbps on my 100Mbps connection.

![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/downloading-edgerouter.png)
![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/downloader-activity-monitor.png)

Once the first file was downloaded and the zip extracted (to a new drive) I felt confident that this was going to be a piece of cake, and kicked off the second download. The download ran at 65 - 70Mbps for most of Sunday and Monday (except when it was paused so I could watch Netflix). By Monday evening the download was finished. It was only when I tried to extract the archive that things started going wrong.

{% highlight bash %}
$ unzip Server_4-27-21-44-11.zip -d /Volumes/Mercury/
Archive: Server_4-27-21-44-11.zip
warning [Server_4-27-21-44-11.zip]: 122632979645 extra bytes at beginning or within zipfile
(attempting to process anyway)
error [Server_4-27-21-44-11.zip]: start of central directory not found;
zipfile corrupt.
(please check that you have transferred or created the zipfile in the
appropriate BINARY mode and that you have compiled UnZip properly)
{% endhighlight %}

I opened a Backblaze support ticket to find out the archives had a checksum I could check (none is displayed on the download page). After a bit of back and forth I discovered that there is no checksum generated on their end that could be used to verify the download, and their suggestion was to create a new restore and try the download again. Unfortunately the second download attempt was much slower.

![Backblaze Downloading](/assets/images/posts/2018-06-04-backblaze/observium.png)

Clearly something was throttling my download speed. I tried restarting the server, the modem, and reinstalling the downloader, but nothing seemed to make any difference. Backblaze support assured me they don't throttle the downloads, and suggested increasing the number of threads used by the downloader. 

They also revealed an interesting tip: backup retention is calculated from the last backup date, so it's possible to keep them longer by uninstalling Backblaze from the computer.

After almost a week the download finished, and (somewhat unsurprisingly) I got the same error extracting the archive. 

I tried Backblaze support again, and this time they suggested trying either [The Unarchiver](https://theunarchiver.com/) or [BetterZip](https://macitbetter.com/) to unzip the archive. The Unarchiver was partially successful, managing to extract a handful of files from the zip after complaining that it was corrupt. BetterZip on the other hand was actually able to open the file and extract everything! It took a while, but as far as I can tell everything seems to be restored.

Overall I'm pretty happy with this. I'm paying a very low price for the service, which I use to back up over 3TB of data. I feel much more confident recommending Backblaze to others now that I've actually been through the process of restoring data. Some things I'll keep in mind for the future:

 * Backup retention is calculated from the last backup date. You can stop backups from being aged off by uninstalling Backblaze (or disconnecting it from the internet) until the data has been restored.
 * Using the Backblaze Downloader with multiple threads can make the best use of your available bandwidth, but remember that a fast internet connection is no use if something upstream is throttling you.
 * [BetterZip](https://macitbetter.com/) was the only tool I could find that would open and extract the 500GB zip file.
 * Test your backups!

Header photo by [Aziz Acharki](https://unsplash.com/photos/7IlaJn7GTFE).