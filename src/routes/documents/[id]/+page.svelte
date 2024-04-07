<script lang="ts">
	import base64 from 'base64-js';
	import QRCode from 'qrcode';

	import { page } from '$app/stores';
	import { PUBLIC_STRAPI_URL, PUBLIC_UNCHAINED_BROKER_URL } from '$env/static/public';

	import { Sia } from 'sializer';
	import { onMount } from 'svelte';

	import Footer from '../../../components/Footer.svelte';
	import Header from '../../../components/Header.svelte';

	import sha3 from 'js-sha3';
	import Back from 'svelte-google-materialdesign-icons/Arrow_back.svelte';
	import Signature from 'svelte-google-materialdesign-icons/Assignment.svelte';
	import ExternalLink from 'svelte-google-materialdesign-icons/Open_in_new.svelte';

	import { AsyncDocument } from '$lib/graphql/generated';
	import { calculateAddress } from '$lib/base32';

	import type { StrapiDocument } from '$lib/types';
	import type { DocumentSigner, DocumentSignautre } from '$lib/types';
	import type { CorrectnessReport } from '$lib/graphql/generated';

	const shake = (input: sha3.Message) => sha3.shake256(input, 512);
	const toByteArray = (input: string) =>
		Uint8Array.from(
			input.match(/[\da-f]{2}/gi)!.map(function (h) {
				return parseInt(h, 16);
			})
		);

	const { id } = $page.params;

	let documentPromise: Promise<StrapiDocument>;
	let document: StrapiDocument;
	let showingQrCode = false;
	let isDocumentValid = true;
	let qrCode: HTMLCanvasElement;
	let signers: DocumentSigner[] = [];
	let signatures: DocumentSignautre[] = [];

	const fetchDocument = async () => {
		const res = await fetch(`/documents/${id}`);
		document = (await res.json()) as StrapiDocument;
		return document;
	};

	const showQrCode = () => {
		showingQrCode = true;
	};

	const closeQrCode = () => {
		showingQrCode = false;
	};

	const getQrCodePayload = () => {
		const timestamp = Math.floor(new Date(document.attributes.publishedAt).getTime() / 1000);
		const hash = toByteArray(document.attributes.hash);
		const topic = toByteArray(shake(document.attributes.topic));
		const valid = isDocumentValid;
		const url = PUBLIC_UNCHAINED_BROKER_URL;

		const sia = new Sia();
		sia.addUInt64(timestamp);
		sia.addByteArray8(hash);
		sia.addByteArray8(topic);
		sia.addBool(valid);
		sia.addString8(url);

		return base64.fromByteArray(sia.content);
	};

	$: if (showingQrCode && document) {
		const payload = getQrCodePayload();
		QRCode.toCanvas(qrCode, payload, { errorCorrectionLevel: 'H' });
	}

	const getDocumentFromUnchained = async (hash: string) => {
		const response = await AsyncDocument({ variables: { hash } });
		const edges = response.data.correctnessReports.edges || [];

		for (const edge of edges) {
			const node = edge?.node;
			if (node) {
				for (const signer of node.signers) {
					signers.push({
						name: signer.name,
						address: calculateAddress(signer.key),
						valid: node.correct
					});
				}
				signatures.push({
					signature: node.signature,
					valid: node.correct
				});
			}
		}

		signatures = signatures;
		signers = signers;
	};

	$: if (document) {
		getDocumentFromUnchained(document.attributes.hash);
	}

	onMount(async () => {
		documentPromise = fetchDocument();
	});
</script>

<Header />

<div class="flex flex-col bg-base-200 grow gap-4 items-center pt-10 pb-20">
	<div class="w-4/5 mx-auto flex flex-col gap-14">
		<div class="flex items-center gap-8">
			<a href="/" class="btn btn-ghost">
				<Back />
				Back
			</a>
			<div class="text-sm breadcrumbs">
				<ul>
					<li><a href="/">Home</a></li>
					<li><a href="/">Documents</a></li>
					<li><a href="/documents/{id}">#{id}</a></li>
				</ul>
			</div>
		</div>

		<div>
			<h2 class="text-xl font-bold mb-4 ml-4">
				Document #{id}
			</h2>

			<div class="flex flex-col gap-8 md:flex-row">
				<!-- Part 1 -->
				<div class="md:flex-1 box-border flex flex-col w-full">
					{#if !document}
						<div class="loading loading-dots m-4"></div>
					{:else}
						<object
							title="Document"
							class="rounded-xl shadow-xl grow w-full min-h-[500px] md:min-h-[600px]"
							data={`${PUBLIC_STRAPI_URL}${document.attributes.document.data.attributes.url}#navpanes=0&view=FitH`}
							width="100%"
							height="auto"
						>
						</object>
					{/if}
				</div>

				<!-- Part 2 -->
				<div
					class="md:flex-1 p-4 card w-full md:w-4/5 mx-auto bg-gray-800 text-white shadow-xl flex flex-col gap-4"
				>
					{#if showingQrCode}
						<h2 class="text-xl font-bold mb-2">Scan QR Code</h2>
						<p>
							Scan the QR code below using the Swørn mobile app to sign the document. Once signed,
							your signature will be recorded on the blockchain.
						</p>

						<div class="flex flex-1 justify-center items-center">
							<canvas id="qrcode" bind:this={qrCode}></canvas>
						</div>

						<div class="flex justify-between items-center">
							<button class="btn btn-ghost" on:click={closeQrCode}>
								<Back />
								Back
							</button>
						</div>
					{:else}
						<h2 class="text-xl font-bold mb-2">Details</h2>
						<p>
							You can find the details of the document here. This includes the document's title,
							author, date of publication, and the number of signers.
						</p>
						<div class="grow flex flex-col gap-4">
							<div class="card w-full mx-auto border border-slate-400">
								<div class="overflow-x-auto">
									{#await documentPromise}
										<div class="loading loading-dots m-4"></div>
									{:then}
										{#if document}
											<table class="table">
												<!-- head -->
												<thead>
													<tr>
														<th></th>
														<th>Attribute</th>
														<th>Value</th>
													</tr>
												</thead>
												<tbody>
													<!-- row 1 -->
													<tr>
														<th>1</th>
														<td>Title</td>
														<td>{document.attributes.title}</td>
													</tr>
													<!-- row 2 -->
													<tr>
														<th>2</th>
														<td>Date Published</td>
														<td
															>{new Date(document.attributes.publishedAt).toLocaleDateString(
																'ch-FR'
															)}</td
														>
													</tr>
													<!-- row 3 -->
													<tr>
														<th>3</th>
														<td>Topic</td>
														<td>{document.attributes.topic}</td>
													</tr>
												</tbody>
											</table>
										{/if}
									{:catch error}
										<div class="text-red-500">{error.message}</div>
									{/await}
								</div>
							</div>
							<a
								href={document?.attributes?.explorer}
								target="_blank"
								class="self-end btn btn-secondary"
							>
								<ExternalLink />
								View on-chain data
							</a>
						</div>
						<div class="flex flex-col gap-4">
							<h3 class="text-lg">Sign the document</h3>
							<p>
								You can sign this document to verify its authenticity. Once signed, the document
								will be marked as valid and the signature will be recorded on the blockchain.
							</p>
						</div>
						<div class="form-control w-52">
							<label class="cursor-pointer label">
								<input
									type="checkbox"
									class="toggle toggle-accent"
									bind:checked={isDocumentValid}
								/>
								<span class="label-text">Document is valid</span>
							</label>
						</div>
						<button class="btn btn-primary" on:click={showQrCode}>
							<Signature /> Sign the document
						</button>
					{/if}
				</div>
			</div>
		</div>

		{#if signatures.length}
			<div class="mb-16">
				<h4 class="mb-8 ml-4">Signatures</h4>
				<div class="card w-full mx-auto bg-gray-800 text-white shadow-xl">
					<div class="overflow-x-auto">
						<table class="table">
							<!-- head -->
							<thead>
								<tr>
									<th></th>
									<th>Signature</th>
									<th>Document Validity</th>
								</tr>
							</thead>
							<tbody>
								{#each signatures as { signature, valid }, index}
									<tr>
										<th> {index + 1} </th>
										<td> 0x{signature} </td>
										<td> {valid ? 'Valid' : 'Invalid'} </td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		{#if signers.length}
			<div class="mb-16">
				<h4 class="mb-8 ml-4">Signers</h4>
				<div class="card w-full mx-auto bg-gray-800 text-white shadow-xl">
					<div class="overflow-x-auto">
						<table class="table">
							<!-- head -->
							<thead>
								<tr>
									<th></th>
									<th>Name</th>
									<th>Address</th>
									<th>Document Validity</th>
								</tr>
							</thead>
							<tbody>
								{#each signers as signer, index}
									<tr>
										<th> {index + 1} </th>
										<td> {signer.name} </td>
										<td> {signer.address} </td>
										<td> {signer.valid ? 'Valid' : 'Invalid'} </td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<Footer />
