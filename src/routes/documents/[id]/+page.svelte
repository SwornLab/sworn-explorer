<script>
	import { page } from '$app/stores';

	import Footer from '../../../components/Footer.svelte';
	import Header from '../../../components/Header.svelte';

	import Back from 'svelte-google-materialdesign-icons/Arrow_back.svelte';
	import Signature from 'svelte-google-materialdesign-icons/Assignment.svelte';
	import ExternalLink from 'svelte-google-materialdesign-icons/Open_in_new.svelte';

	const { id } = $page.params;
</script>

<Header />

<div class="flex flex-col bg-base-200 grow gap-4 items-center pt-10 pb-20">
	<div class="w-4/5 mx-auto flex flex-col gap-14">
		<div class="flex flex items-center gap-8">
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

			<div class="flex flex-col md:flex-row">
				<!-- Part 1 -->
				<div class="md:flex-1 p-4 pt-0 pl-0 pb-0 box-border flex flex-col">
					<object
						title="Document"
						class="rounded-xl shadow-xl grow w-full min-h-[500px] md:min-h-[600px]"
						data="/samples/whitepaper.pdf#navpanes=0&view=FitH"
						width="100%"
						height="auto"
					>
					</object>
				</div>

				<!-- Part 2 -->
				<div
					class="md:flex-1 p-4 card w-4/5 mx-auto bg-gray-800 text-white shadow-xl flex flex-col gap-4"
				>
					<h2 class="text-xl font-bold mb-2">Details</h2>
					<p>
						You can find the details of the document here. This includes the document's title,
						author, date of publication, and the number of signers.
					</p>
					<div class="grow flex flex-col gap-4">
						<div class="card w-full mx-auto border border-slate-400">
							<div class="overflow-x-auto">
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
											<td>Quality Control Specialist</td>
										</tr>
										<!-- row 2 -->
										<tr>
											<th>2</th>
											<td>Date Published</td>
											<td>Date</td>
										</tr>
										<!-- row 3 -->
										<tr>
											<th>3</th>
											<td>Topic</td>
											<td>Yumi Gold</td>
										</tr>
									</tbody>
								</table>
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
							You can sign this document to verify its authenticity. Once signed, the document will
							be marked as valid and the signature will be recorded on the blockchain.
						</p>
					</div>
					<div class="form-control w-52">
						<label class="cursor-pointer label">
							<input type="checkbox" class="toggle toggle-accent" checked />
							<span class="label-text">Document is valid</span>
						</label>
					</div>
					<button class="btn btn-primary"> <Signature /> Sign Document </button>
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
