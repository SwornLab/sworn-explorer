<script lang="ts">
	import base64 from 'base64-js';
	import QRCode from 'qrcode';

	import { page } from '$app/stores';
	import { PUBLIC_STRAPI_URL } from '$env/static/public';

	import { Sia } from 'sializer';
	import { onMount } from 'svelte';

	import Footer from '../../../components/Footer.svelte';
	import Header from '../../../components/Header.svelte';

	import sha3 from 'js-sha3';
	import Back from 'svelte-google-materialdesign-icons/Arrow_back.svelte';
	import Signature from 'svelte-google-materialdesign-icons/Assignment.svelte';
	import ExternalLink from 'svelte-google-materialdesign-icons/Open_in_new.svelte';
	import Download from 'svelte-google-materialdesign-icons/Download.svelte';
	import Check from 'svelte-google-materialdesign-icons/Check.svelte';
	import Close from 'svelte-google-materialdesign-icons/Close.svelte';

	import { calculateAddress } from '$lib/base32';

	import type { StrapiDocument } from '$lib/types';
	import type { DocumentSigner, DocumentSignautre } from '$lib/types';
	import { base64toHex } from '$lib/base64';

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
		const url = 'wss://broker.unchained.timeleap.swiss/0.14.0';

		const encoder = new TextEncoder();

		const sia = new Sia();
		sia.addUInt64(timestamp);
		sia.addByteArray8(hash);
		sia.addByteArray8(topic);
		sia.addByteArray32(encoder.encode(JSON.stringify({ correct: valid })));
		sia.addString8(url);

		return base64.fromByteArray(sia.content);
	};

	$: if (qrCode && showingQrCode && document) {
		const payload = getQrCodePayload();
		QRCode.toCanvas(qrCode, payload, { errorCorrectionLevel: 'H' });
		const computedStyle = window.getComputedStyle(qrCode);
		const width = parseInt(computedStyle.width.slice(0, -2), 10);
		const height = parseInt(computedStyle.height.slice(0, -2), 10);
		qrCode.style.height = `${Math.min(width, height)}px`;
		qrCode.style.width = `${Math.min(width, height)}px`;
	}

	const getDocumentFromUnchained = async (hash: string) => {
		const request = await fetch(`/api/unchained/document/${hash}`);
		const response = await request.json();

		if (!response) {
			signatures = [];
			signers = [];
			return;
		}

		signatures = [
			{ signature: base64toHex(response.data.signature), valid: response.data.meta.correct }
		];

		signers = response.signers.map((signer: any) => {
			console.log(signer.shortpublickey);
			const address = calculateAddress(signer.shortpublickey);
			return { name: signer.name, address, valid: response.data.meta.correct };
		});
	};

	$: if (document) {
		getDocumentFromUnchained(document.attributes.hash);
	}

	onMount(async () => {
		documentPromise = fetchDocument();
	});
</script>

<svelte:head>
	{#if document}
		<meta name="description" content={document.attributes.title} />
		<title>{document?.attributes?.title} | Unchained Explorer</title>
	{:else}
		<title>Loading | Unchained Explorer</title>
	{/if}
</svelte:head>

<Header />

<div class="flex flex-col bg-zinc-950 grow gap-4 items-center pt-10 pb-20">
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
			<h2 class="text-xl font-bold mb-4 ml-4 font-serif">
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
							class="rounded-xl shadow-xl grow w-full h-full"
							data={`${PUBLIC_STRAPI_URL}${document.attributes.document.data.attributes.url}#navpanes=0&view=FitH`}
							width="100%"
							height="auto"
						>
							<div class="card bg-zinc-900 flex flex-col gap-8 p-4 text-white">
								<span class="text-lg font-bold"> Not Supported </span>
								<p class="grow">
									Your browser does not support PDFs. You can download the PDF to view it:
								</p>
								<a
									class="btn btn-secondary"
									href={`${PUBLIC_STRAPI_URL}${document.attributes.document.data.attributes.url}`}
								>
									<Download /> Download PDF
								</a>
							</div>
						</object>
					{/if}
				</div>

				<!-- Part 2 -->
				<div
					class="md:flex-1 p-4 card w-full md:w-4/5 mx-auto bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-xl flex flex-col gap-4"
				>
					{#if showingQrCode}
						<h2 class="text-xl grow font-bold mb-2">Scan QR Code</h2>
						<p>
							Scan the QR code below using the Unchained Identity mobile app to sign the document.
							Once signed, your signature will be recorded on the blockchain.
						</p>

						<div class="flex justify-center items-center h-full w-full">
							<canvas id="qrcode" class="max-w-full max-h-full w-auto h-auto" bind:this={qrCode}
							></canvas>
						</div>

						<div class="flex justify-between items-center">
							<button class="btn btn-ghost" on:click={closeQrCode}>
								<Back />
								Back
							</button>
						</div>
					{:else}
						<h2 class="text-xl font-bold mb-2 font-serif">Details</h2>
						<p>
							You can find the details of the document here. This includes the document's title,
							author, date of publication, and the number of signers.
						</p>
						<div class="grow flex flex-col gap-4">
							<div class="card w-full mx-auto border border-zinc-700">
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
														<td>{new Date(document.attributes.publishedAt).toLocaleDateString()}</td
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
							{#if document?.attributes?.explorer}
								<a
									href={document?.attributes?.explorer}
									target="_blank"
									class="self-end btn bg-green-400 hover:bg-green-300 transition-colors text-black"
								>
									<ExternalLink />
									View on-chain data
								</a>
							{/if}
						</div>
						<div class="flex flex-col gap-4 mt-4">
							<h3 class="text-lg font-serif">Sign the document</h3>
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
						<button
							class="btn bg-green-400 hover:bg-green-300 transition-colors text-black"
							on:click={showQrCode}
						>
							<Signature /> Sign the document
						</button>
					{/if}
				</div>
			</div>
		</div>

		{#if signatures.length}
			<div class="mb-16">
				<h4 class="mb-8 ml-4 font-serif">Signatures</h4>
				<div
					class="card w-full mx-auto bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-xl"
				>
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
										<td class="font-mono"> 0x{signature} </td>
										<td>
											{#if valid}
												<Check />
											{:else}
												<Close />
											{/if}
										</td>
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
				<h4 class="mb-8 ml-4 font-serif">Signers</h4>
				<div
					class="card w-full mx-auto bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800 text-white shadow-xl"
				>
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
										<td class="font-mono"> {signer.address} </td>
										<td>
											{#if signer.valid}
												<Check />
											{:else}
												<Close />
											{/if}
										</td>
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
