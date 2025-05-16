interface MuxAsset {
	data: {
		status: string;
		playback_ids: {
			policy: string;
			id: string;
		}[];
		id: string;
		created_at: string;
	};
}
