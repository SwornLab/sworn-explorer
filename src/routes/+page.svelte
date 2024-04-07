<script lang="ts">
	import { onMount } from 'svelte';
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
	import { link } from '$lib/link';
	import { AsyncDocumentsList } from '$lib/graphql/generated';

	import type { CorrectnessReport } from '$lib/graphql/generated';
	import type { DocumentSignerCount, StrapiDocument } from '$lib/types';

	let documents: StrapiDocument[] = [];
	let unchainedData: CorrectnessReport[];
	let hashToSigner = new Map<string, DocumentSignerCount>();

	onMount(async () => {
		try {
			const res = await fetch('/documents');
			documents = await res.json();

			// fetch unchained data
			const unchainedRes = await AsyncDocumentsList({
				variables: {
					topic:
						'1ce3d8f55311bf6fe438a273bb0b91bc923c81fc6c1547829b1c26029a8edc3afaa602c6cbf57abf09ab6d2b1750e7bc32aaddab5b0a65fc1f1d97d6cb76de15'
				}
			});

			if (unchainedRes.data.correctnessReports.edges) {
				unchainedData = unchainedRes.data.correctnessReports.edges.map(
					(edge) => edge?.node
				) as CorrectnessReport[];
			}

			for (const report of unchainedData) {
				const currentCount: DocumentSignerCount = hashToSigner.get(report.hash) || {
					valid: 0,
					invalid: 0
				};

				console.log({ report });

				if (report.correct) {
					currentCount.valid++;
				} else {
					currentCount.invalid++;
				}

				hashToSigner.set(report.hash, currentCount);
			}

			hashToSigner = hashToSigner;
		} catch (error) {
			console.error(error);
		}
	});
</script>

<Header />

<div class="flex flex-col bg-base-200 grow gap-4 items-center pt-20 pb-20">
	<div class="w-4/5 mx-auto">
		<h2 class="text-xl ml-4 text-white">Latest data</h2>
		<div class="ml-4 mt-2">You can find the latest data published to the Swørn network here.</div>
	</div>
	<div class="card w-4/5 mx-auto bg-gray-800 text-white shadow-xl">
		<div class="overflow-x-auto">
			<table class="table">
				<!-- head -->
				<thead>
					<tr>
						<th></th>
						<th>Document</th>
						<th>Date</th>
						<th>Signed Valid</th>
						<th>Signed Invalid</th>
					</tr>
				</thead>
				<tbody>
					{#each documents as document}
						<tr use:link={'/documents/' + document.id} class="cursor-pointer">
							<th>{document.id}</th>
							<td>{document.attributes.title}</td>
							<td>{new Date(document.attributes.date).toLocaleDateString('ch-FR')}</td>
							<td>{hashToSigner.get(document.attributes.hash)?.valid || 0}</td>
							<td>{hashToSigner.get(document.attributes.hash)?.invalid || 0}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<Footer />
