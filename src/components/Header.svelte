<script lang="ts">
	import Icon from '@iconify/svelte';
	import X from './candy/X.svelte';
</script>

<div
	class="bg-[url('/images/prism.jpg')] bg-cover bg-center py-28 px-4 md:px-8 relative w-4/5 rounded-3xl mx-auto overflow-hidden flex items-center mt-12 md:mt-20 border border-zinc-800"
>
	<div class="absolute inset-0 opacity-10 z-0 x">
		<X />
	</div>
	<div class="flex flex-col gap-4 rounded-2xl p-8 w-1/4 min-w-[300px] relative z-10">
		<a href="/">
			<h1 class="text-3xl text-white font-serif">Unchained Explorer</h1>
		</a>
		<div class="flex gap-4">
			<a
				href="http://timeleap.swiss"
				target="_blank"
				class="text-green-400 hover:text-green-300 transition-colors"
			>
				By Timeleap <Icon icon="carbon:arrow-up-right" class="w-6 h-6 inline-block" />
			</a>
		</div>
	</div>
</div>

<style lang="postcss">
	.x {
		mask-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
	}
</style>
