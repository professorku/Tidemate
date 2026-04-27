export function normalizeMessagePage(pageData) {
  const chronologicalResults = [...pageData.results].reverse()

  return {
    ...pageData,
    results: chronologicalResults,
    hasOlder: Boolean(pageData.nextCursor || pageData.next),
  }
}

export function createInitialMessagesPagination() {
  return {
    count: 0,
    page: 1,
    totalPages: 1,
    next: null,
    previous: null,
    nextCursor: null,
    previousCursor: null,
    hasOlder: false,
    ordering: [],
  }
}
