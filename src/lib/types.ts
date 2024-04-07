export interface StrapiMedia {
	attributes: {
		id: number;
		name: string;
		alternativeText: string | null;
		caption: string | null;
		width: number | null;
		height: number | null;
		hash: string;
		ext: string;
		mime: string;
		size: number;
		url: string;
		provider: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface StrapiDocument {
	id: number;
	attributes: {
		title: string;
		date: string;
		topic: string;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
		hash: string;
		explorer: string;
		document: {
			data: StrapiMedia;
		};
	};
}

export interface StrapiMeta {
	pagination: {
		page: number;
		pageSize: number;
		pageCount: number;
		total: number;
	};
}

export interface StrapiDocumentListResponse {
	data: StrapiDocument[];
	meta: StrapiMeta;
}

export interface StrapiDocumentResponse {
	data: StrapiDocument;
}

export interface DocumentSigner {
	address: string;
	name: string;
	valid: boolean;
}

export interface DocumentSignautre {
	signature: string;
	valid: boolean;
}

export interface DocumentSignerCount {
	valid: number;
	invalid: number;
}
