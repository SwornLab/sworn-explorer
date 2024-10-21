<script lang="ts">
	import { onMount } from 'svelte';
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
	import { link } from '$lib/link';

	import type { StrapiDocument } from '$lib/types';
	import { base64toHex } from '$lib/base64';

	let documents: StrapiDocument[] = [];
	let hashToSigner = new Map<string, number>();

	onMount(async () => {
		try {
			const res = await fetch('/documents');
			documents = await res.json();

			const signaturesRes = await fetch('/api/unchained/signatures');
			const signatures = await signaturesRes.json();

			hashToSigner = new Map(
				signatures.map((signature: any) => [base64toHex(signature.hash), signature.signers])
			);
		} catch (error) {
			console.error(error);
		}
	});
</script>

<Header />

<div class="flex flex-col bg-zinc-950 grow gap-4 items-center pt-20 pb-20">
	<div class="w-4/5 mx-auto">
		<h2 class="text-xl ml-4 text-white">Latest data</h2>
		<div class="ml-4 mt-2">
			You can find the latest data published to the Unchained network here.
		</div>
	</div>
	<div class="card w-4/5 mx-auto bg-zinc-900 text-white shadow-xl">
		<div class="overflow-x-auto">
			<table class="table">
				<!-- head -->
				<thead>
					<tr>
						<th></th>
						<th>Document</th>
						<th>Date</th>
						<th>Signatures</th>
					</tr>
				</thead>
				<tbody>
					{#each documents as document}
						<tr use:link={'/documents/' + document.id} class="cursor-pointer">
							<th>{document.id}</th>
							<td>{document.attributes.title}</td>
							<td>{new Date(document.attributes.date).toLocaleDateString()}</td>
							<td>{hashToSigner.get(document.attributes.hash) || 0}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<Footer />
