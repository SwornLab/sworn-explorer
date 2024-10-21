import { json } from '@sveltejs/kit';
import { getAttestationsBySigner } from '$lib/mongo';
import { addCorsHeaders } from '$lib/cors';

import HttpStatusCodes from 'http-status-codes';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event: RequestEvent) => {
	const hash = event.params.hash;

	if (!hash) {
		return addCorsHeaders(
			json({ errors: ['Hash is required'] }, { status: HttpStatusCodes.BAD_REQUEST })
		);
	}

	const data = await getAttestationsBySigner(hash);
	return addCorsHeaders(json(data));
};

export { OPTIONS } from '$lib/cors';
