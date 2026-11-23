import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteBook, fetchBooks } from '../../api/books';
import { fetchCategories } from '../../api/categories';
import { toErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Pagination } from '../../components/Pagination';
import { EmptyState, TableSkeleton } from '../../components/States';
import type { Book, Category, Paginated } from '../../types';

export function BooksPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [books, setBooks] = useState<Paginated<Book> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [deleting, setDeleting] = useState(false);

    const categoryId = Number(searchParams.get('category')) || null;
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);

    useEffect(() => {
        const controller = new AbortController();

        fetchCategories(controller.signal)
            .then((response) => setCategories(response.data))
            .catch(() => {
                /* El filtro queda deshabilitado si las categorías fallan. */
            });

        return () => controller.abort();
    }, []);

    const loadBooks = useCallback(
        async (signal: AbortSignal) => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetchBooks({ category: categoryId, page }, signal);
                setBooks(response);
            } catch (caught) {
                if (signal.aborted) {
                    return;
                }

                setError(toErrorMessage(caught));
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        },
        [categoryId, page],
    );

    useEffect(() => {
        const controller = new AbortController();
        void loadBooks(controller.signal);

        return () => controller.abort();
    }, [loadBooks]);

    const updateQuery = (next: { category?: number | null; page?: number }) => {
        const params = new URLSearchParams();

        const nextCategory =
            next.category !== undefined ? next.category : categoryId;

        if (nextCategory) {
            params.set('category', String(nextCategory));
        }

        if (next.page && next.page > 1) {
            params.set('page', String(next.page));
        }

        setSearchParams(params);
    };

    const handleDelete = async () => {
        if (!bookToDelete) {
            return;
        }

        setDeleting(true);

        try {
            await deleteBook(bookToDelete.id);
            setBookToDelete(null);

            const controller = new AbortController();
            await loadBooks(controller.signal);
        } catch (caught) {
            setError(toErrorMessage(caught));
        } finally {
            setDeleting(false);
        }
    };

    const selectedCategory = categories.find((category) => category.id === categoryId);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Libros</h1>
                    <p className="text-sm text-slate-500">
                        Consulta, crea, edita y elimina los libros de la biblioteca.
                    </p>
                </div>
                <Link
                    to="/books/new"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Nuevo libro
                </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center">
                <label className="text-sm font-medium text-slate-700" htmlFor="category-filter">
                    Filtrar por categoría
                </label>
                <select
                    id="category-filter"
                    className="w-full rounded-md border-0 px-3 py-2 text-sm shadow-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:max-w-xs"
                    value={categoryId ?? ''}
                    onChange={(event) =>
                        updateQuery({
                            category: event.target.value ? Number(event.target.value) : null,
                        })
                    }
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {selectedCategory ? (
                    <button
                        type="button"
                        onClick={() => updateQuery({ category: null })}
                        className="cursor-pointer text-sm text-indigo-600 hover:underline"
                    >
                        Quitar filtro
                    </button>
                ) : null}
            </div>

            {error ? (
                <Alert onDismiss={() => setError(null)}>{error}</Alert>
            ) : null}

            {loading && !books ? (
                <TableSkeleton />
            ) : books && books.data.length === 0 ? (
                <EmptyState
                    title="No hay libros para mostrar"
                    description={
                        selectedCategory
                            ? `No se encontraron libros en la categoría "${selectedCategory.name}".`
                            : 'Todavía no se ha registrado ningún libro en la biblioteca.'
                    }
                    action={
                        <Link
                            to="/books/new"
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Crear el primer libro
                        </Link>
                    }
                />
            ) : books ? (
                <div className="overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Título
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Autor
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Año
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Categoría
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'divide-y divide-slate-100 opacity-50' : 'divide-y divide-slate-100'}>
                            {books.data.map((book) => (
                                <tr key={book.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{book.title}</p>
                                        {book.description ? (
                                            <p className="line-clamp-1 max-w-md text-xs text-slate-500">
                                                {book.description}
                                            </p>
                                        ) : null}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{book.author}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {book.published_year}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                            {book.category?.name ?? 'Sin categoría'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/books/${book.id}/edit`}
                                                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                                            >
                                                Editar
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => setBookToDelete(book)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="border-t border-slate-200 px-4 py-3">
                        <Pagination
                            currentPage={books.meta.current_page}
                            lastPage={books.meta.last_page}
                            total={books.meta.total}
                            onChange={(nextPage) => updateQuery({ page: nextPage })}
                        />
                    </div>
                </div>
            ) : null}

            <ConfirmDialog
                open={bookToDelete !== null}
                title="Eliminar libro"
                message={
                    <>
                        ¿Seguro que quieres eliminar <strong>{bookToDelete?.title}</strong>? Esta
                        acción no se puede deshacer.
                    </>
                }
                busy={deleting}
                onConfirm={() => void handleDelete()}
                onCancel={() => setBookToDelete(null)}
            />
        </section>
    );
}
