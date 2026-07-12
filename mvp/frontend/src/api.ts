const API_BASE = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export interface User {
  id: number;
  email: string;
  restaurantName: string;
  slug: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  sort_order: number;
  items: Item[];
}

export interface Item {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  available: number;
}

export interface PublicMenu {
  restaurant: { name: string; slug: string };
  categories: Category[];
}

function getToken() {
  return localStorage.getItem('dm_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `Request failed: ${res.status}`);
  }
  return json.data as T;
}

export const auth = {
  register: (body: { email: string; password: string; restaurantName: string; slug: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<User>('/api/auth/me'),
};

export const menu = {
  get: () => request<Category[]>('/api/menu'),
  createCategory: (name: string) =>
    request<Category>('/api/menu/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (id: number, name: string) =>
    request<Category>(`/api/menu/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (id: number) =>
    request<{ id: number }>(`/api/menu/categories/${id}`, { method: 'DELETE' }),
  createItem: (body: { categoryId: number; name: string; description?: string; price: number; available?: number }) =>
    request<Item>('/api/menu/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id: number, body: Partial<Item>) =>
    request<Item>(`/api/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteItem: (id: number) =>
    request<{ id: number }>(`/api/menu/items/${id}`, { method: 'DELETE' }),
};

export const publicApi = {
  getMenu: (slug: string) => request<PublicMenu>(`/api/public/menu/${slug}`),
  getQr: (slug: string) => request<{ url: string; qrDataUrl: string }>(`/api/public/qr/${slug}`),
};
