# `BaseHub <> MUX` Integration Demo

<video width="100%" height="auto" controls>
  <source src="https://assets.basehub.com/321e4840/aa578cd508fdeabaf6057f93174f7d58/demo1080.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

This is a [Cloudflare Workers](https://developers.cloudflare.com/workers/) API demo using [Hono](https://hono.dev/docs/getting-started/cloudflare-workers) for API routing. The flow looks something like this: `BaseHub Webhook -> Our CF Worker API -> MUX`, then, in the opposite direction, we take the MUX asset information and store it on BaseHub: `MUX Asset Info -> Our CF Worker API -> BaseHub`. We achieve this by:

Exposing a `/mux` route that does the following in order:

* Authenticates the BaseHub workflow webhook.
* Gets the uploaded video URL and creates an asset on MUX.
* Retrieves the MUX asset `Playback ID` and updates the `Mux Video Block` to store that ID.

On your frontend, you can grab that `Playback ID` to request the video stream from MUX. Take a look at this [BaseHub public repo](https://basehub.com/joyco/basehub-mux-demo) to see the complete setup.

## Why did we choose this setup?

BaseHub provides useful information about a source `.mp4` video, like `width`, `height`, and `aspect-ratio`. But it doesn’t serve `HLS` video format, which is known for reliable, fast playback and adaptive quality based on network conditions.

Luckily, BaseHub is an extensible platform that enables you to plug in any webhook triggered by an action taken over a block—that’s what’s happening here. We get the best of both worlds, dynamic video content managed through a CMS + HLS video streaming.

## Local Setup

You'll need an existing BaseHub repo (see our [example repo here](https://basehub.com/joyco/basehub-mux-demo)), and a MUX account to upload videos to.

Add the following environment variables to your `.dev.vars` file:

```env
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""
BASEHUB_TOKEN="" # IMPORTANT: this needs to be an Admin Token, so your sever can use the BaseHub Mutation API
BASEHUB_REF="main"
```

## Cloudflare setup

- Add the `.dev.vars` contents through the CF dashboard for your Workers project.
- At build time, the [basehub sdk](https://github.com/basehub-ai/basehub) needs to generate types, so we need both `BASEHUB_TOKEN` and `BASEHUB_REF` env vars, you need to explicitly add those through the CF dashboard for the build process.
