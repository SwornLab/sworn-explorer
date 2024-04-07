import { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
	schema: process.env.PUBLIC_UNCHAINED_GRAPHQL_URL,
	documents: ['./src/lib/graphql/queries.graphql'],
	generates: {
		'./src/lib/graphql/generated.ts': {
			plugins: ['typescript', 'typescript-operations', 'graphql-codegen-svelte-apollo'],
			config: {
				clientPath: '../apollo.ts',
				asyncQuery: true
			}
		}
	}
};

export default config;
