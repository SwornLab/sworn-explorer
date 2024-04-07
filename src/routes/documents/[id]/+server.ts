import { SECRET_STRAPI_API_KEY } from '$env/static/private';
import { PUBLIC_STRAPI_URL } from '$env/static/public';
import type { StrapiDocumentResponse } from '$lib/types';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const { id } = params;

	const response = await fetch(`${PUBLIC_STRAPI_URL}/api/documents/${id}?populate=document`, {
		headers: {
			Authorization: `Bearer ${SECRET_STRAPI_API_KEY}`
		}
	});

	if (!response.ok) {
		return error(response.status, `Error fetching document: ${response.statusText}`);
	}

	const { data } = (await response.json()) as StrapiDocumentResponse;

	return json(data);
}
