export type PaginatedResponse<T> = {
	items: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

export type InfiniteResult<T> = {
	items: T[];
	nextCursor: string | undefined;
};

