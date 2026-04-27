export const PREVIEW_PAGE_SIZE = 100

export function createEmptyNotificationsPage() {
  return {
    count: 0,
    next: null,
    previous: null,
    page: 1,
    pageSize: PREVIEW_PAGE_SIZE,
    totalPages: 1,
    results: [],
  }
}
