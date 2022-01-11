---
title: Wrangling Gmail Filters
---

I’ve long been an advocate for using filters to improve the signal to noise ratio of email. Ideally you want this stuff to happen on the mail server, so that the filtering happens automatically, regardless of where you actually read your mail. I like to keep most mail that isn’t directly for me out of my inbox, and then automatically mark as read things that are noisy or just notifications / informational.

Gmail lets you create some pretty complex filters, but the UI for managing these can get quite cumbersome once you have more than a handful of rules. Fortunately [gmail-yaml-filters](https://github.com/mesozoic/gmail-yaml-filters) exists to simplify the process.

I started by exporting my current rules as a backup, and then worked through the list duplicating them in the `yaml` syntax. I was able to take the 28 rules exported from Gmail and represent them in just 6 top level rules. Running `gmail-yaml-filters` on this file creates (more-or-less) exactly the same set of rules. 

By combining rule definitions using the `more` operator the rules are much simpler to parse. For example, I like to label mailing lists and move them out of the inbox. By using `more` I can then selectively mark as read or delete. 

{% highlight yaml %}
- list: <list.name>
  label: "Some List"
  archive: true
  not_important: true
  more:
    - subject: "Some annoying notification"
      read: true

    - from: something-noisy@example.com
      read: true
      delete: true
{% endhighlight %}

This generates an xml file with 3 filters:

 1. Everything from the mailing list is labeled with `Some List`, and archived.
 2. If the subject matches `Some annoying notification ` it will be marked as read.
 3. If the sender is `something-noisy@example.com` it will be deleted.

To build this inside Gmail I would need to remember to add all the conditions and actions for every rule - forgetting to add the `list` condition to the last rule would delete everything from that address, not just messages to that list.

It’s also easy to make quite complex rules, although the yaml does get a bit harder to read:

{% highlight yaml %}
wordlist: &wordlist
  - webcast
  - webinar
  - workshop
  - scrum

- from:
    not:
      - work.com
      - example.com
  more:
    - subject: { any: [*wordlist] }
      label: Webinars
      archive: true

    - has: { any: [*wordlist] }
      label: Webinars
      archive: true
{% endhighlight %}

By not having any actions in the top level element, this creates two rules, which both include the `not` filter at the top.

Once you have a working filter set it only takes a few minutes to export it as xml, and import into Gmail. Technically you could give it access to do this for you but I don’t really trust anything to log into my email.