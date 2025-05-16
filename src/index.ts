import { basehub } from 'basehub';
import { authenticateWebhook } from 'basehub/workflows';

import { Hono } from 'hono';
import { error, success } from './lib/response';

const app = new Hono<{ Bindings: Env }>();

app.get('/', () => success({ data: 'ok', message: 'Made by rebels' }));

app.post('/mux', async (c) => {
	const headers = c.req.raw.headers;
	const body = await c.req.json();

	if (!c.env.BASEHUB_TOKEN || !c.env.BASEHUB_REF) {
		return error({ message: 'BASEHUB_TOKEN and BASEHUB_REF are not set' });
	}

	const basehubClient = basehub({
		token: c.env.BASEHUB_TOKEN,
		ref: c.env.BASEHUB_REF,
		draft: true,
	});

	const {
		workflows: {
			muxWorkflow: { webhookSecret },
		},
	} = await basehubClient.query({
		workflows: {
			muxWorkflow: {
				webhookSecret: true,
			},
		},
	});

	const result = await authenticateWebhook({
		body: body,
		signature: headers,
		secret: webhookSecret,
	});

	if (!result.success) {
		return error({ message: 'Invalid secret' });
	}

	const blockId = result.payload.data.blockId;

	const targetVideo = await basehubClient.query({
		_componentInstances: {
			muxVideo: {
				__args: {
					filter: {
						_id: { eq: blockId },
					},
				},
				item: {
					targetVideo: {
						url: true,
					},
				},
			},
		},
	});

	const videoUrl = targetVideo._componentInstances.muxVideo.item?.targetVideo.url;

	if (!videoUrl) {
		return error({ message: 'No video URL found for this block.' });
	}

	if (!c.env.MUX_TOKEN_ID || !c.env.MUX_TOKEN_SECRET) {
		return error({ message: 'MUX_TOKEN_ID and MUX_TOKEN_SECRET are not set' });
	}

	const muxRes = await fetch('https://api.mux.com/video/v1/assets', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Basic ' + btoa(`${c.env.MUX_TOKEN_ID}:${c.env.MUX_TOKEN_SECRET}`),
		},
		body: JSON.stringify({
			inputs: [{ url: videoUrl }],
			playback_policies: ['public'],
			video_quality: 'basic',
		}),
	});

	if (!muxRes.ok) {
		const errText = await muxRes.text();
		return error({ message: `Mux API error: ${muxRes.status} ${errText}` });
	}

	const muxData: MuxAsset = await muxRes.json();

	const playbackId = muxData.data.playback_ids[0].id;

	const basehubMutation = await basehubClient.mutation({
		transaction: {
			__args: {
				data: {
					type: 'update',
					id: blockId,
					children: {
						playbackId: {
							type: 'text',
							value: playbackId,
						},
					},
				},
			},
			status: true,
			message: true,
		},
	});

	const mutationStatus = basehubMutation.transaction.status;

	if (mutationStatus !== 'Completed') {
		return error({ message: 'Failed to update block' });
	}

	return success({ data: muxData, message: 'Mux asset created' });
});

export default app;