# Forgejo Discord Webhook Enhancer

This repository houses the source of the Forgejo Discord Webhook Enhancer.

## What is that?

It's a site that allows you to filter out unwanted Event sub-types such as issue edits, release edits, etc. by simply selecting the events you want.

## Why does it exist?

The Discord Webhook feature of Forgejo is nice for a quick and simple `Repository -> Discord Channel` bridge to show new commits, opened issues, etc.

One big issue with it however, is that you may receive webhook messages for events you don't want to show. A good example are issues. Selecting the `issues` event for webhook triggers will send webhooks for when an issue is opened or closed, but also for when it gets edited.  
Unfortunately does Forgejo not yet have any way to select only specific types of an event. And they lack the required manpower to implement this.

This is where this Site comes into play!  
The site will do the job of filtering out event types you don't want in your Discord Channel to show.

## How does it work?

On the site itself do you provide the URL of the Discord Webhook, select the event types you want to receive webhook messages for and then generate the URL.  
The URL itself is similar in structure to the Discord webhook one (In fact it has the same `api/webhooks/<id>/<token>` structure), but differs in that it also has a `/<number>` added at the end. This number holds the individual events that should be allowed through.

By now pasting this URL in the Webhook settings of your repository, will any request be send through the site, which filters out the events you didn't include and forward the rest towards Discord.  
Any filtered out event will simply return a `204` response to avoid displaying any errors in the webhook history on your repository.