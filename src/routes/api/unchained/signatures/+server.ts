import { json } from '@sveltejs/kit';
import { getSignatures } from '$lib/mongo';
import { addCorsHeaders } from '$lib/cors';

import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const data = await getSignatures();
	return addCorsHeaders(json(data));
};

export { OPTIONS } from '$lib/cors';
