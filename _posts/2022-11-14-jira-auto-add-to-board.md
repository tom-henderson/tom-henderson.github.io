---
title: Automatically move Jira Issues from Backlog to Board
---

In a next-gen Jira project with a backlog, new tasks go onto the backlog by default. This seems like a decent default, since it keeps the board more or less clear of new tasks until you're ready to start working on them. What's always bothered me is that issues don't move onto the board when they transition into 'In Progress'.

Where this starts to get silly is when you start using the Slack shortcut to create and transition issues. I can create an issue from a Slack message, assign it to myself, transition to In Progress, and then transition to Done, all from Slack. Great! Except the issue is _still_ stuck on the backlog!

I had assumed that I could fix this with an automation action, and it turns out you can, in a fairly round-about way. Since there's no built in automation action that can move a issue to a board, we need to call the rest API instead, which we can do with the `Send web request` action.

![](/assets/images/posts/jira-automation.png)

Find your board's ID from its URL: if your board is at `/jira/software/projects/ABC/boards/123` then your board ID is `123`, and the URL to use in the action will be `/rest/agile/1.0/board/123/issue`.

You'll also need to provide a `Authorization` header for the request, using the API token of a user with permission to move issues to your board. You can generate it with `echo "Basic $(echo -n "me@example.com:API-TOKEN" | base64)"`.

You can use whatever trigger you like for this - I settled on: `Issue transitions from Committed to In Progress` and `Issue Description contains 'Issue created in Slack'`. 