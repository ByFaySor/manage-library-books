import type { ValidationErrors } from '../types';

const BASE_URL = '/api/v1';

export class ApiError extends Error {
    public constructor(
        message: string,
        public readonly status: number,
        public readonly errors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'ApiError';
    }

    public get isValidationError(): boolean {
        return this.status === 422;
    }

    public get fieldErrors(): Record<string, string> {
        return Object.fromEntries(
            Object.entries(this.errors).map(([field, messages]) => [
                field,
                messages[0] ?? 'Valor no válido.',
            ]),
        );
    }
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    signal?: AbortSignal;
}

/**
 * Solicitud JSON genérica contra la API de Laravel.
 * Convierte las respuestas de error de Laravel (404, 409, 422) en `ApiError`.
 */
export async function request<T>(
    path: string,
    { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        signal,
        headers: {
            Accept: 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const payload = (data ?? {}) as {
            message?: string;
            errors?: ValidationErrors;
        };

        throw new ApiError(
            payload.message ?? 'Ha ocurrido un error inesperado.',
            response.status,
            payload.errors ?? {},
        );
    }

    return data as T;
}

/**
 * Coloca la respuesta de una solicitud con error en el estado de un componente.
 */
export function toErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof TypeError) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    }

    return 'Ha ocurrido un error inesperado.';
}
