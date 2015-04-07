---
layout: post
title: Backing up Dokuwiki to GitHub
---

[Dokuwiki](https://www.dokuwiki.org/dokuwiki#) is a simple wiki that stores it's data in plaintext files instead of a database. It's an ideal tool for internal documentation, especially since it can be easily configured to authenticate against Active Directory, and use ACLs to controll access to wiki sections.

As part of a backup review process I've been moving towards reducing the amount of data we back up unnecessarily. In particular there's not much reason to back up entire servers when they can be rebuilt from scratch so easily. With that in mind it seemed like the simplest way to back up dokuwiki would be to use GitHub, with the added advantage of having versioned backups.

I added a new machine user to our GitHub account and set it up with ssh keys, created a new repository, and pushed the current state of the wiki to it. I then added a simple nightly cron job to commit and push any changes. 

    #!/bin/bash

    cd /var/www
    git commit -a -m "Wiki backup $(date +%F-%s)"
    git push

![Backup History](/assets/images/github-wiki.png)

Git is smart about this, so if nothing has changed, nothing is pushed. Backup history can be easily viewed by looking at the commits history.

The best part about this is that since the data is just text, all our documentation is now available directly on GitHub. In the event of a major outage I can browse the wiki pages directly on GitHub.

![Accessing Wiki Pages on GitHub](/assets/images/github-wiki-pages.png)