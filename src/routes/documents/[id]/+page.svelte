<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_STRAPI_URL, PUBLIC_UNCHAINED_BROKER_URL } from '$env/static/public';
	import base64 from 'base64-js';
	import QRCode from 'qrcode';
	import { Sia } from 'sializer';
	import { onMount } from 'svelte';

	import Footer from '../../../components/Footer.svelte';
	import Header from '../../../components/Header.svelte';

	import type { StrapiDocument } from '$lib/types';
	import sha3 from 'js-sha3';
	import Back from 'svelte-google-materialdesign-icons/Arrow_back.svelte';
	import Signature from 'svelte-google-materialdesign-icons/Assignment.svelte';
	import ExternalLink from 'svelte-google-materialdesign-icons/Open_in_new.svelte';

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
	let isDocumentValid = false;
	let qrCode: HTMLCanvasElement;

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
		const timestamp = new Date(document.attributes.publishedAt).getTime();
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

	const getMediaUrl = () => {
		const url = `${PUBLIC_STRAPI_URL}${document.attributes.document.data.attributes.url}`;
		// To be able to embed the document without Google Docs, we need to configure Strapi to allow any origin when embedding
		return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
	};

	$: if (showingQrCode && document) {
		const payload = getQrCodePayload();
		QRCode.toCanvas(qrCode, payload, { errorCorrectionLevel: 'H' });
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
							data={`${getMediaUrl()}#navpanes=0&view=FitH`}
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
						<div class="flex justify-between items-center">
							<div>Scan the QR code for signing</div>
							<button class="btn btn-ghost" on:click={closeQrCode}>
								<Back />
								Back
							</button>
						</div>
						<div class="flex flex-1 justify-center items-center">
							<canvas id="qrcode" bind:this={qrCode}></canvas>
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
													<tr class="cursor-pointer">
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
							<a href="/documents/{id}" class="self-end btn btn-secondary">
								<ExternalLink />
								View on-chain data
							</a>
						</div>
						<div class="flex flex-col gap-4">
							<h3 class="text-lg">Sign Document</h3>
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
							<Signature /> Sign Document
						</button>
					{/if}
				</div>
			</div>
		</div>

		<div class="card w-full mx-auto bg-gray-800 text-white shadow-xl p-4">
			Signature: 0x1234567890abcdef
		</div>

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
							</tr>
						</thead>
						<tbody>
							<!-- row 1 -->
							<tr class="cursor-pointer">
								<th>1</th>
								<td>Cy Ganderton</td>
								<td> SHAKFUYTWQKFNASDJY </td>
							</tr>
							<!-- row 2 -->
							<tr>
								<th>2</th>
								<td>Hart Hagerty</td>
								<td> SHAKFUYTWQKFNASDJY </td>
							</tr>
							<!-- row 3 -->
							<tr>
								<th>3</th>
								<td>Brice Swyre</td>
								<td> SHAKFUYTWQKFNASDJY </td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<Footer />
