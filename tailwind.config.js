/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte,js,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Geist"'],
				mono: ['"Geist Mono"'],
				serif: ['"Aleo"']
			}
		}
	},
	plugins: [require('@tailwindcss/typography'), require('daisyui')]
};
