export interface Category {
    id: number;
    name: string;
    books_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface Book {
    id: number;
    title: string;
    author: string;
    description: string | null;
    published_year: number;
    category_id: number;
    category?: {
        id: number;
        name: string;
    };
    created_at?: string | null;
    updated_at?: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
    current_page?: number;
    last_page?: number;
}

export interface BookPayload {
    title: string;
    author: string;
    description: string | null;
    published_year: number;
    category_id: number;
}

/** Errores de validación devueltos por Laravel con estado 422. */
export type ValidationErrors = Record<string, string[]>;

export type FieldErrors = Record<string, string>;
