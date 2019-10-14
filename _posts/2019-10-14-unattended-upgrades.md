---
layout: post
title: Ubuntu Unattended Upgrades
comments: true
image: /assets/headers/nikolai-chernichenko-VVqk1YRrEmE-unsplash.jpg
image_credit: Nikolai Chernichenko
image_url: https://unsplash.com/photos/VVqk1YRrEmE
---

One of the things I love about my work is getting to dive into some system in order to work out how all the pieces fit together. One system I've been looking into recently is the `unattended-upgrades` package in Ubuntu. What seemed like a pretty straightforward thing actually turns out to be quite flexible.

## Basic Configuration

Configuration for unattended upgrades is stored in the `apt` configuration, under `/etc/apt/apt.conf.d/`. There may be a default file `50unattended-upgrades`, which you can modify with your preferences. 

The first things we need to set are under `APT::Periodic` and control the frequency of unattended upgrades.

{% highlight bash %}
APT::Periodic::RandomSleep "1800";
APT::Periodic::Update-Package-Lists "always"; # How often to run apt-get update (days)
APT::Periodic::Download-Upgradeable-Packages "always";  # How often to download packages (days)
APT::Periodic::Unattended-Upgrade "always"; # How often to install packages (days)
APT::Periodic::AutocleanInterval "7"; # How often to clean up unused packages
{% endhighlight %}

Values for `Update-Package-Lists`, `Download-Upgradeable-Packages` and `Unattended-Upgrade` are the minimal interval between runs, and can be either a numeric number of days, defined as seconds, minutes or hours (eg `3h` or `90m`), or `always`.[^1]

[^1]: https://unix.stackexchange.com/questions/178626/how-to-run-unattended-upgrades-not-daily-but-every-few-hours/541426#541426

The next thing we need to configure are the `Unattended-Upgrade` settings, which control the actual operation of the unattended upgrades scripts, starting with `Allowed-Origins`.

This setting controls what package origins will be included in unattended upgrades. To make this more portable we can use the `${distro_id}` and `${distro_codename}` variables in here. If you only want 'security' patches, leave the last item off the list.

{% highlight bash %}
Unattended-Upgrade::Allowed-Origins {
	"${distro_id}:${distro_codename}";
	"${distro_id}:${distro_codename}-security";
	"${distro_id}ESM:${distro_codename}";
	"${distro_id}:${distro_codename}-updates";
};
{% endhighlight %}

If you have third party apt reposities configured you can add them to this list if you want them to be included. To do this find the corresponding file in `/var/lib/apt/lists` with a name ending with `InRelease`, and search it for the the `Origin` and `Suite`, and add these to the `Allowed-Origins`, eg: `"Docker:${distro_codename}";`.[^2]

[^2]: https://askubuntu.com/questions/87849/how-to-enable-silent-automatic-updates-for-any-repository

Next we configure automatic reboots, which will be required to install some updates (eg kernel updates). 

{% highlight bash %}
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
Unattended-Upgrade::Automatic-Reboot-WithUsers "false";
{% endhighlight %}

`Automatic-Reboot` allows us to disable this completely by setting `false`, in which case we will need to monitor for required reboots and perform them manually (more on that later). Otherwise, reboots will be scheduled using the value set for `Automatic-Reboot-Time`. Since this is passed directly as a parameter to `/sbin/shutdown -r`, which means we can use `now`,  a time like `04:00`, or even include a message to be displayed to logged in users like `04:00 'An automatic reboot has been scheduled'`.

Finally we can configure some cleanup options. These are fairly self-explanitory, however you may prefer to leave these set to false to ensure packages are not removed from critical systems.

{% highlight bash %}
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
{% endhighlight %}

# How it works

## Cron Trigger

### /etc/crontab
* runs all scripts in /etc/cron.daily at 6:25am every day, unless anacron is installed[^1] [^2]

[^1]: [change cron daily run time on ubuntu](https://serverfault.com/questions/569586/change-cron-daily-run-time-on-ubuntu)
[^2]: [at what time does cron execute daily scripts?](https://askubuntu.com/questions/36971/at-what-time-does-cron-execute-daily-scripts)

{% highlight bash %}
17 *	* * *	root	cd / && run-parts --report /etc/cron.hourly
25 6	* * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6	* * 7	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6	1 * *	root	test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
{% endhighlight %}

### /etc/cron.daily/apt-compat
* exit if systemd is detected - the systemd trigger will be used instead
* sleep for a random interval of time, maximum `APT::Periodic::RandomSleep`
* check that we're not on battery
* calls `/usr/lib/apt/apt.systemd.daily`

## Anacron Trigger

### /etc/anacrontab
* runs all scripts in /etc/cron.daily at 7:30am every day, with a 5 minute delay

{% highlight bash %}
1   5   cron.daily   nice run-parts --report /etc/cron.daily
{% endhighlight %}

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
* [The shutdown program on a modern systemd-based Linux system](https://utcc.utoronto.ca/~cks/space/blog/linux/SystemdVersionOfShutdown)

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


## Logging

Activity is logged to:
* /var/log/unattended-upgrades/unattended-upgrades-dpkg.log
* /var/log/unattended-upgrades/unattended-upgrades.log
* /var/log/unattended-upgrades/unattended-upgrades-shutdown.log

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


# Apt Automatic Updates Config

https://help.ubuntu.com/lts/serverguide/automatic-updates.html
https://help.ubuntu.com/community/AutomaticSecurityUpdates
