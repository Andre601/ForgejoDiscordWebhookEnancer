# Forgejo → Discord Webhook Filter

This repository hosts the source of the `Forgejo → Discord` filter available at [forgejo-discord-webhook-enancer.vercel.app/](https://forgejo-discord-webhook-enancer.vercel.app/).

## What is this?

This site serves a specific purpose: Only send Embeds to Discord if their event type (and action) match ones you've selected.  
Should a webhook POST request be received with an event type or action value that does not match the values defined in the URL, will the site not forward any webhook to discord and instead silently ignore it with a `204` response.

## Why does this exist?

Forgejo does not have any way to define only specific actions of an event to be forwarded to Discord.  
As an example, if you select `issues` will Forgejo send Webhook requests for issues that have been opened, closed, but also edited. This can create a lot of noice in one's Discord Channel, depending on how frequent such events would happen.

For more details check [`forgejo/forgejo#3288` on Codeberg.org](https://codeberg.org/forgejo/forgejo/issues/3288).

## How does this work?

On the Site can you paste in a Discord Webhook URL, select the events you want forwarded and then generate a URL. This URL will contain the ID and Token of the Webhook, as well as a Base36-encoded Bitmask containing the individual events you selected.  
This URL would now be used in your Forgejo Repository as a Webhook target URL (Make sure that you use a Forgejo Webhook, not Discord!) to forward POST requests.

Whenever the site now receives a request will it check the URL for the values (ID, Token and encoded Bitmask), extract them and process the request accordingly.

## Current Limitations

- Only the events listed on the site are actually supported. Any additional events wanted need to be manually added (Contributions welcome!).
- The JSON for the Webhook requests need to be manually created. The site can't work with, nor use the JSON Forgejo would send for a Discord webhook.
- There is currently no way of defining a Webhook avatar and Username. You need to set those in your Discord server directly.
