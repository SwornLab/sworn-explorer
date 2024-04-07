import { SECRET_STRAPI_API_KEY } from '$env/static/private';
import { PUBLIC_STRAPI_URL } from '$env/static/public';
import type { StrapiDocumentListResponse } from '$lib/types';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const response = await fetch(`${PUBLIC_STRAPI_URL}/api/documents`, {
		headers: {
			Authorization: `Bearer ${SECRET_STRAPI_API_KEY}`
		}
	});

	if (!response.ok) {
		return error(response.status, `Error fetching documents: ${response.statusText}`);
	}

	const { data } = (await response.json()) as StrapiDocumentListResponse;

	return json(data);
}
