---
layout: post
title: Starting from scratch
header: closeup-macbook.jpg
---

I've always been slighly proud of the fact that my OS X home folder has stayed with me for so long, across so many devices. It started life on our PowerMac G4, and has stayed with me through my 12" Powerbook, and my previous 13" Powerbook since 2010. 

Apple's Migration Assistant has come a long way since the first time I used it, and for users at work I don't hesitate to use it to move their settings from machine to machine. When an account has been around as long as mine though it does pick up a fair amount of cruft, so I figured it was time to rebuild.

When my new 13" Retina MacBook arrived (3GHz i7, 16GB, 512GB) I decided to rebuild from scratch, installing only what I actually needed. 

## First Steps

After admiring the retina display for a while, I decided on the best way to get started:

1. [Dropbox](http://www.dropbox.com)
2. [1Password](https://agilebits.com/onepassword)
3. [Chrome](https://www.google.com/chrome/browser/)

Installing Dropbox pulls down my 1Password database. Next I installed 1Password (from the App Store), followed by Chrome. Signing in to Chrome installs all my Chrome extensions and bookmarks, which means as far as browsers go I'm pretty much finished.

## Copy Files

To make things easier I synced my SuperDuper backup drive, attached it to the new machine, and copied the files from there. I hadn't noticed that the Sites folder was no longer included in the default home directory. See the fix below to get it working again.

 * ~/Desktop
 * ~/Documents
 * ~/Downloads
 * ~/Movies
 * ~/Music
 * ~/Pictures
 * ~/Sites

## Install Applications

### Non App Store

In no particular order. I was surprised at how many of these just needed a log in to get back up and running. 

 * [iTerm 2](http://iterm2.com/): Settings synced in my dotfiles repo.
 * [SublimeText3](http://www.sublimetext.com/3).
 * Office 2011: One day I won't need this.
 * Creative Cloud: Log in, start downloading.
 * LogMeIn Client: Log in, done.
 * FirstClass: Ugh. The only app that's not retina.
 * VMware Fusion
 * [Transmit](http://panic.com/transmit/): Settings synced through Dropbox.
 * [OmniGraffle](https://www.omnigroup.com/omnigraffle): A license for this was included on my 12" PowerBook.
 * [SuperDuper](http://www.shirt-pocket.com/SuperDuper/SuperDuperDescription.html)
 * [VLC](http://www.videolan.org/)
 * [Spotify](http://spotify.com/): Log in, done.
 * [Notational Velocity](http://notational.net/): Log in to simplenote to sync.
 * [Transmission](https://www.transmissionbt.com/)
 * [Beamer](http://beamer-app.com/)
 * [TextExpander](http://smilesoftware.com/TextExpander/index.html)
 
### App Store

It's a shame the 'Purchases' tab doesn't show free apps, and that there's no way to hide apps you don't want. Mine is filling up with apps I know I'll never use again.

 * Remote Desktop Client
 * Radium
 * Evernote
 * Skitch
 * NameMangler
 * Caffiene
 * Xcode

### System Utilities

 * [Bartender](http://www.macbartender.com/)
 * [Backblaze](http://backblaze.com): [Transfer backup state](https://help.backblaze.com/entries/20198082-How-do-I-install-a-new-OS-or-move-computers-and-not-have-Backblaze-upload-all-my-files-again-), then uninstall from the old machine.
 * [Itsycal](http://www.mowglii.com/itsycal/)
 * [SizeUp](http://www.irradiatedsoftware.com/sizeup/)
 * [Colour Picker](https://github.com/tom-henderson/colour-picker)
 * [QLStephen](http://whomwah.github.io/qlstephen/)
 * [Fliqlo Screensaver](http://fliqlo.com/)

## Dev Stuff

### Git

Git isn't actually installed by default, but if you run it you get an install prompt and OS X installs a bunch of dev stuff. I wish I'd paid a bit more attention here. 

### Dotfiles & System Settings

Worth rebooting after this. 

    cd ~
    git clone https://github.com/tom-henderson/dotfiles.git
    ln -s dotfiles/bash_profile .bash_profile
    ln -s dotfiles/gitconfig .gitconfig
    ln -s dotfiles/screenrc .screenrc
    ln -s dotfiles/scripcs .scr
    ./dotfiles/keyboard-shortcuts.sh
    ./dotfiles/config-osx.sh
    reboot

### SSH

    ssh-keygen -t rsa -C "${myemail}"
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_rsa

### Virtualenvwrapper

    easy_install pip
    pip install virtualenvwrapper

### Jekyll:

    gem install jekyll

### Apache & Sites Folders

Not sure when this was removed from OSX, but it's easy to turn back on.

{% gist 3905f332592ed1f87411 %}

### SublimeText3 Packages

I really need to get my SublimeText configuration into git. 

 * Package Control
 * Theme - Soda
 * SideBarEnhancements
 * GitGutter
 * Djaneiro
 * SublimeLinter

## Migrate Settings

### Messages History

Do this before opening Messages. Restores all the message history, attachments etc.

    cp /Volumes/Backup/Users/tom/Library/Messages ~/Library/
    cp /Volumes/Backup/Users/tom/Library/Containers/com.apple.iChat ~/Library/Containers/

### Microsoft User Data

Why do they insist on dumping this in ~/Documents?

    mv ~/Documents ~/Library/Preferences

### ColorSync Profiles

It took far to long to get my work monitor looking right. I'm not doing it again.

    cp /Volumes/Backup/Users/tom/Library/ColorSync/profiles ~/Library/ColorSync/

### Color Pickers, Swatches and Palettes

    cp /Volumes/Backup/Users/tom/Library/ColorPickers ~/Library/
    cp /Volumes/Backup/Users/tom/Library/Colors ~/Library/

## Finishing Up

At this point I can get 99% of my work done without any issue. I'll keep carrying around my backup drive from the old MacBook for now, but I should be able to recover any ~/Library files I need from BackBlaze if I do come across anything that's worth migrating over.

As a last step I deleted the iWork/iLife apps I don't use (Pages, Numbers, Keynote, iMovie and GarageBand), to free over 5.5GB of space. They may be great apps, but I'd rather just download them again if I need them.