export type PaginatedResponse<T> = {
  items: Array<T>
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type InfiniteResult<T> = {
  items: Array<T>
  nextCursor: string | undefined
}
