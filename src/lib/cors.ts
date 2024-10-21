export async function OPTIONS() {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}
	});
}

export const addCorsHeaders = (response: Response) => {
	response.headers.append('Access-Control-Allow-Origin', '*');
	response.headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	return response;
};
