export const base64toHex = (base64: string) =>
	[...atob(base64)].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
