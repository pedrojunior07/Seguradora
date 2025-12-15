export function normalizeListResponse(data) {
  if (!data) return { items: [], meta: null };
  if (Array.isArray(data)) return { items: data, meta: null };
  if (Array.isArray(data.data)) {
    const { data: items, ...meta } = data;
    return { items, meta };
  }
  return { items: [], meta: null };
}
