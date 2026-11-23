import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
    createCategory,
    deleteCategory,
    fetchCategories,
    updateCategory,
} from '../../api/categories';
import { ApiError, toErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { inputClasses } from '../../components/Field';
import { EmptyState, TableSkeleton } from '../../components/States';
import type { Category } from '../../types';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);

        try {
            const response = await fetchCategories(signal);
            setCategories(response.data);
        } catch (caught) {
            if (!signal?.aborted) {
                setError(toErrorMessage(caught));
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void load(controller.signal);

        return () => controller.abort();
    }, [load]);

    const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setCreating(true);

        try {
            await createCategory(newName.trim());
            setNewName('');
            await load();
        } catch (caught) {
            if (caught instanceof ApiError && caught.isValidationError) {
                setError(caught.fieldErrors.name ?? caught.message);
            } else {
                setError(toErrorMessage(caught));
            }
        } finally {
            setCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!editing) {
            return;
        }

        setSavingEdit(true);
        setError(null);

        try {
            await updateCategory(editing.id, editingName.trim());
            setEditing(null);
            await load();
        } catch (caught) {
            if (caught instanceof ApiError && caught.isValidationError) {
                setError(caught.fieldErrors.name ?? caught.message);
            } else {
                setError(toErrorMessage(caught));
            }
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            await deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
            await load();
        } catch (caught) {
            if (caught instanceof ApiError && caught.status === 409) {
                setError(caught.message);
            } else {
                setError(toErrorMessage(caught));
            }

            setCategoryToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
                <p className="text-sm text-slate-500">
                    Una categoría no puede eliminarse mientras tenga libros asociados.
                </p>
            </div>

            {error ? <Alert onDismiss={() => setError(null)}>{error}</Alert> : null}

            <form
                className="flex flex-col gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 sm:flex-row"
                onSubmit={(event) => void handleCreate(event)}
            >
                <input
                    type="text"
                    aria-label="Nombre de la nueva categoría"
                    placeholder="Nombre de la nueva categoría"
                    className={inputClasses(false)}
                    value={newName}
                    maxLength={100}
                    onChange={(event) => setNewName(event.target.value)}
                    required
                    minLength={2}
                />
                <Button type="submit" disabled={creating || newName.trim().length < 2}>
                    {creating ? 'Añadiendo…' : 'Añadir categoría'}
                </Button>
            </form>

            {loading && categories.length === 0 ? (
                <TableSkeleton rows={4} />
            ) : categories.length === 0 ? (
                <EmptyState
                    title="Sin categorías"
                    description="Crea al menos una categoría antes de registrar libros."
                />
            ) : (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            {editing?.id === category.id ? (
                                <div className="flex flex-1 gap-2">
                                    <input
                                        type="text"
                                        aria-label="Editar nombre de la categoría"
                                        className={inputClasses(false)}
                                        value={editingName}
                                        maxLength={100}
                                        onChange={(event) => setEditingName(event.target.value)}
                                    />
                                    <Button
                                        onClick={() => void handleUpdate()}
                                        disabled={savingEdit || editingName.trim().length < 2}
                                    >
                                        Guardar
                                    </Button>
                                    <Button variant="secondary" onClick={() => setEditing(null)}>
                                        Cancelar
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-slate-900">
                                            {category.name}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                            {category.books_count ?? 0}{' '}
                                            {(category.books_count ?? 0) === 1 ? 'libro' : 'libros'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            className="text-indigo-600 hover:bg-indigo-50"
                                            onClick={() => {
                                                setEditing(category);
                                                setEditingName(category.name);
                                                setError(null);
                                            }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => setCategoryToDelete(category)}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                open={categoryToDelete !== null}
                title="Eliminar categoría"
                message={
                    <>
                        ¿Seguro que quieres eliminar <strong>{categoryToDelete?.name}</strong>?
                    </>
                }
                busy={deleting}
                onConfirm={() => void handleDelete()}
                onCancel={() => setCategoryToDelete(null)}
            />
        </section>
    );
}
