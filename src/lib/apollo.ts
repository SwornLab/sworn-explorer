import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/index.js';
import { PUBLIC_UNCHAINED_GRAPHQL_URL } from '$env/static/public';

function createApolloClient() {
	const link = new HttpLink({ uri: PUBLIC_UNCHAINED_GRAPHQL_URL });
	const cache = new InMemoryCache();

	const client = new ApolloClient({
		link,
		cache
	});

	return client;
}

export default createApolloClient();
