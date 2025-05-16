# `Basehub<>MUX` Demo

This is a [Cloudflare Workers](https://developers.cloudflare.com/workers/) API demo using [Hono](https://hono.dev/docs/getting-started/cloudflare-workers) for API routing.

It exposes a `/mux` route that does the following in order:
- Authenticates the basehub workflow webhook.
- Get's the uploaded video url and creates an asset on mux.
- Get's the mux asset `Playback ID` and updates the `Mux Video Block` to store that id.

On your frontend's side, you can grab that `Playback ID` to request mux the video stream. Take a look at this [basehub public repo](https://basehub.com/joyco/basehub-mux-demo) to see the complete setup.

## Setup
You'll need to add these env vars to the `.dev.vars` file.

```env
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""
BASEHUB_TOKEN=""
BASEHUB_REF="main"
```