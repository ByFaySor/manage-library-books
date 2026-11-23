import type { Book, BookPayload, Paginated } from '../types';
import { request } from './client';

export interface BookFilters {
    category?: number | null;
    page?: number;
}

export function fetchBooks(
    { category, page = 1 }: BookFilters = {},
    signal?: AbortSignal,
): Promise<Paginated<Book>> {
    const params = new URLSearchParams();

    if (category) {
        params.set('category', String(category));
    }

    if (page > 1) {
        params.set('page', String(page));
    }

    const query = params.toString();

    return request<Paginated<Book>>(`/books${query ? `?${query}` : ''}`, {
        signal,
    });
}

export function fetchBook(id: number, signal?: AbortSignal): Promise<{ data: Book }> {
    return request<{ data: Book }>(`/books/${id}`, { signal });
}

export function createBook(payload: BookPayload): Promise<{ data: Book }> {
    return request<{ data: Book }>('/books', { method: 'POST', body: payload });
}

export function updateBook(id: number, payload: BookPayload): Promise<{ data: Book }> {
    return request<{ data: Book }>(`/books/${id}`, {
        method: 'PUT',
        body: payload,
    });
}

export function deleteBook(id: number): Promise<void> {
    return request<void>(`/books/${id}`, { method: 'DELETE' });
}
