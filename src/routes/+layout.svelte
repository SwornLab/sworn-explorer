<script>
	import 'tailwindcss/tailwind.css';
	import 'unfonts.css';
</script>

<div class="flex flex-col h-screen w-screen bg-zinc-950">
	<slot />
</div>

<style lang="postcss">
	:global(html) {
		background-color: theme(colors.zinc.950) !important;
	}
</style>
