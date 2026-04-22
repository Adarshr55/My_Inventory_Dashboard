const BASE_URL = 'http://localhost:8000/api';

export async function getInventory(params?: {
  category?: string;
  stock_status?: string;
  name?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.stock_status) query.set('stock_status', params.stock_status);
  if (params?.name) query.set('name', params.name);

  const res = await fetch(`${BASE_URL}/inventory/?${query.toString()}`, {
    cache: 'no-store'
  });
  return res.json();
}

export async function updateInventoryItem(
  id: string,
  data: { reorder_point?: number; notes?: string }
) {
  const res = await fetch(`${BASE_URL}/inventory/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}