export function link(node: HTMLElement, href: string) {
	// Attach a click event listener to the node
	node.addEventListener('click', () => {
		window.location.href = href;
	});

	return {
		destroy() {
			// Clean up by removing the event listener when the element is destroyed
			node.removeEventListener('click', () => {
				window.location.href = href;
			});
		}
	};
}
