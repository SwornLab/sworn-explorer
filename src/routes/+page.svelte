<script>
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
	import { link } from '$lib/link';
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
						<th>Signers</th>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					<tr use:link={'/documents/1'} class="cursor-pointer">
						<th>1</th>
						<td>Cy Ganderton</td>
						<td>Quality Control Specialist</td>
						<td>0</td>
					</tr>
					<!-- row 2 -->
					<tr>
						<th>2</th>
						<td>Hart Hagerty</td>
						<td>Desktop Support Technician</td>
						<td>11</td>
					</tr>
					<!-- row 3 -->
					<tr>
						<th>3</th>
						<td>Brice Swyre</td>
						<td>Tax Accountant</td>
						<td>37</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>

<Footer />
