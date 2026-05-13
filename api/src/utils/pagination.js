export function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function paginated(data, total, page, pageSize) {
  return { data, meta: { total, page, pageSize, pages: Math.ceil(total / pageSize) || 1 } };
}

export function dateOrNull(value) {
  return value ? new Date(value) : null;
}
