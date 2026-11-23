import type { Category } from '../types';
import { request } from './client';

export function fetchCategories(signal?: AbortSignal): Promise<{ data: Category[] }> {
    return request<{ data: Category[] }>('/categories', { signal });
}

export function createCategory(name: string): Promise<{ data: Category }> {
    return request<{ data: Category }>('/categories', {
        method: 'POST',
        body: { name },
    });
}

export function updateCategory(id: number, name: string): Promise<{ data: Category }> {
    return request<{ data: Category }>(`/categories/${id}`, {
        method: 'PUT',
        body: { name },
    });
}

export function deleteCategory(id: number): Promise<void> {
    return request<void>(`/categories/${id}`, { method: 'DELETE' });
}
