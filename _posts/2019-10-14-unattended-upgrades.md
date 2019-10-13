---
layout: post
title: Ubuntu Unattended Upgrades
comments: true
image: /assets/headers/nikolai-chernichenko-VVqk1YRrEmE-unsplash.jpg
image_credit: Nikolai Chernichenko
image_url: https://unsplash.com/photos/VVqk1YRrEmE
---

# Apt Automatic Updates Config

https://help.ubuntu.com/lts/serverguide/automatic-updates.html
https://help.ubuntu.com/community/AutomaticSecurityUpdates

## Show resultant configuration
{% highlight bash %}
apt-config dump Unattended-Upgrade
apt-config dump APT::Periodic
apt-config dump APT::Update::Post-Invoke-Success
apt-config dump DPkg::Pre-Invoke
apt-config dump DPkg::Pre-Install-Pkgs
apt-config dump DPkg::Post-Invoke
{% endhighlight %}

## Dry Run:
{% highlight bash %}
sudo unattended-upgrade --dry-run --debug
{% endhighlight %}

# How it works

## Cron Trigger

### /etc/crontab
* runs all scripts in /etc/cron.daily at 6:25am every day[^1] [^2]

[^1]: [change cron daily run time on ubuntu](https://serverfault.com/questions/569586/change-cron-daily-run-time-on-ubuntu)
[^2]: [at what time does cron execute daily scripts?](https://askubuntu.com/questions/36971/at-what-time-does-cron-execute-daily-scripts)

{% highlight bash %}
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user	command
17 *	* * *	root    cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
{% endhighlight %}

### /etc/cron.daily/apt-compat
* exit if systemd is detected - the systemd trigger will be used instead
* sleep for a random interval of time, maximum `APT::Periodic::RandomSleep`
* check that we're not on battery
* calls `/usr/lib/apt/apt.systemd.daily`

## Systemd Trigger

Show timers:
`systemctl --all list-timers apt-daily{,-upgrade}.timer`

### apt-daily.timer
* `/lib/systemd/system/apt-daily.service`
* `/lib/systemd/system/apt-daily.timer`
* calls `/usr/lib/apt/apt.systemd.daily` to trigger updates of package lists
* time is randomized across a whole day
* [how to run unattended upgrades not daily but every few hours](https://unix.stackexchange.com/questions/178626/how-to-run-unattended-upgrades-not-daily-but-every-few-hours/541426#541426)

{% highlight bash %}
[Timer]
OnCalendar=*-*-* 6,18:00
RandomizedDelaySec=12h
{% endhighlight %}

### apt-daily-upgrade.timer
* `/lib/systemd/system/apt-daily-upgrade.service`
* `/lib/systemd/system/apt-daily-upgrade.timer`
* calls `/usr/lib/apt/apt.systemd.daily` to trigger package installation
* starts after `apt-daily.timer` completes
* time is randomized across 60 minutes

{% highlight bash %}
[Timer]
OnCalendar=*-*-* 6:00
RandomizedDelaySec=60m
{% endhighlight %}

## Unattended Upgrade

### /usr/lib/apt/apt.systemd.daily
* Reads all `APT::Periodic config` to decide what to do
* calls `/usr/bin/unattended-upgrade` to perform required actions (check / download / install etc)

### /usr/bin/unattended-upgrade
* this is where the updates are actually installed
* makes calls to `apt` to do all work
* if a reboot is required
  * creates `/var/run/reboot-required`
  * schedules the reboot it with `/sbin/shutdown -r Unattended-Upgrade::Automatic-Reboot-Time`

## Reboots

### /var/run/reboot-required
* this file will contain details of the packages that require a reboot
* `/var/run` is the system tmp directory and is cleared on reboot
* `/run/systemd/shutdown/scheduled` will contain details of a shutdown or reboot scheduled by `/sbin/shutdown`

### /run/systemd/shutdown/scheduled
* shows details of a scheduled shutdown, eg
{% highlight bash %}
USEC=1537242600000000
WARN_WALL=1
MODE=poweroff
{% endhighlight %}
* [systemd: how to check scheduled time of a delayed shutdown](https://unix.stackexchange.com/questions/229745/systemd-how-to-check-scheduled-time-of-a-delayed-shutdown)

{% highlight bash %}
if [ -f /run/systemd/shutdown/scheduled ]; then
  perl -wne 'm/^USEC=(\d+)\d{6}$/ and printf("Shutting down at: %s\n", scalar localtime $1)' < /run/systemd/shutdown/scheduled
fi
{% endhighlight %}

## What is updated

* `Unattended-Upgrade::Allowed-Origins` contains a list of packages origins that will be allowed to auto-update
* Each item is in the format `"<origin>:<archive>";`
* Variables `${distro_id}` `${distro_codename}` can be used to reference the running distro's sources
* To add third party repositories:
  * look in `/var/lib/apt/lists` for the files ending with `InRelease`
  * in these files find the `Origin` and `Suite`
  * add to `Unattended-Upgrade::Allowed-Origins` in the format `"<origin>:<suite>";`


https://askubuntu.com/questions/87849/how-to-enable-silent-automatic-updates-for-any-repository

## Logging

Activity is logged to:
* /var/log/unattended-upgrades/unattended-upgrades-dpkg.log
* /var/log/unattended-upgrades/unattended-upgrades.log
* /var/log/unattended-upgrades/unattended-upgrades-shutdown.log
