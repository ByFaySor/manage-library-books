import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBook, fetchBook, updateBook } from '../../api/books';
import { fetchCategories } from '../../api/categories';
import { ApiError, toErrorMessage } from '../../api/client';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Field, inputClasses } from '../../components/Field';
import type { BookPayload, Category, FieldErrors } from '../../types';

interface BookForm {
    title: string;
    author: string;
    description: string;
    published_year: string;
    category_id: string;
}

const emptyForm: BookForm = {
    title: '',
    author: '',
    description: '',
    published_year: String(new Date().getFullYear()),
    category_id: '',
};

const currentYear = new Date().getFullYear();

const MIN_YEAR = 1000;

export function BookFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEditing = id !== undefined;
    const bookId = isEditing ? Number(id) : null;
    const navigate = useNavigate();

    const [form, setForm] = useState<BookForm>(emptyForm);
    const [categories, setCategories] = useState<Category[]>([]);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        fetchCategories(controller.signal)
            .then((response) => setCategories(response.data))
            .catch((caught) => setError(toErrorMessage(caught)));

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (bookId === null || Number.isNaN(bookId)) {
            setLoading(false);
            setError('El identificador del libro no es válido.');

            return;
        }

        const controller = new AbortController();

        fetchBook(bookId, controller.signal)
            .then(({ data }) => {
                setForm({
                    title: data.title,
                    author: data.author,
                    description: data.description ?? '',
                    published_year: String(data.published_year),
                    category_id: String(data.category_id),
                });
            })
            .catch((caught) => {
                if (!controller.signal.aborted) {
                    setError(toErrorMessage(caught));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [bookId]);

    const setField = (field: keyof BookForm) => (value: string) => {
        setForm((previous) => ({ ...previous, [field]: value }));
        setFieldErrors((previous) => {
            const next = { ...previous };
            delete next[field];

            return next;
        });
    };

    const validate = (): FieldErrors => {
        const errors: FieldErrors = {};
        const year = Number(form.published_year);

        if (form.title.trim().length < 3) {
            errors.title = 'El título debe tener al menos 3 caracteres.';
        }

        if (form.author.trim() === '') {
            errors.author = 'El autor es obligatorio.';
        }

        if (form.published_year === '' || Number.isNaN(year) || year < MIN_YEAR || year > currentYear) {
            errors.published_year = `El año debe estar entre ${MIN_YEAR} y ${currentYear}.`;
        }

        if (form.category_id === '') {
            errors.category_id = 'Selecciona una categoría.';
        }

        return errors;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const clientErrors = validate();

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);

            return;
        }

        const payload: BookPayload = {
            title: form.title.trim(),
            author: form.author.trim(),
            description: form.description.trim() === '' ? null : form.description.trim(),
            published_year: Number(form.published_year),
            category_id: Number(form.category_id),
        };

        setSaving(true);

        try {
            if (bookId !== null) {
                await updateBook(bookId, payload);
            } else {
                await createBook(payload);
            }

            navigate('/books');
        } catch (caught) {
            if (caught instanceof ApiError && caught.isValidationError) {
                setFieldErrors(caught.fieldErrors);
                setError('Revisa los campos marcados en rojo.');

                return;
            }

            setError(toErrorMessage(caught));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <div>
                <Link to="/books" className="text-sm text-indigo-600 hover:underline">
                    ← Volver a los libros
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                    {isEditing ? 'Editar libro' : 'Nuevo libro'}
                </h1>
                <p className="text-sm text-slate-500">
                    Los campos marcados con * son obligatorios.
                </p>
            </div>

            {error ? <Alert>{error}</Alert> : null}

            {loading ? (
                <div className="h-72 animate-pulse rounded-lg bg-slate-200/70" />
            ) : (
                <form
                    className="space-y-5 rounded-lg bg-white p-6 ring-1 ring-slate-200"
                    onSubmit={(event) => void handleSubmit(event)}
                    noValidate
                >
                    <Field label="Título" htmlFor="title" required error={fieldErrors.title}>
                        <input
                            id="title"
                            type="text"
                            className={inputClasses(Boolean(fieldErrors.title))}
                            value={form.title}
                            maxLength={255}
                            onChange={(event) => setField('title')(event.target.value)}
                        />
                    </Field>

                    <Field label="Autor" htmlFor="author" required error={fieldErrors.author}>
                        <input
                            id="author"
                            type="text"
                            className={inputClasses(Boolean(fieldErrors.author))}
                            value={form.author}
                            maxLength={150}
                            onChange={(event) => setField('author')(event.target.value)}
                        />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label="Año de publicación"
                            htmlFor="published_year"
                            required
                            error={fieldErrors.published_year}
                        >
                            <input
                                id="published_year"
                                type="number"
                                min={MIN_YEAR}
                                max={currentYear}
                                className={inputClasses(Boolean(fieldErrors.published_year))}
                                value={form.published_year}
                                onChange={(event) => setField('published_year')(event.target.value)}
                            />
                        </Field>

                        <Field
                            label="Categoría"
                            htmlFor="category_id"
                            required
                            error={fieldErrors.category_id}
                        >
                            <select
                                id="category_id"
                                className={inputClasses(Boolean(fieldErrors.category_id))}
                                value={form.category_id}
                                onChange={(event) => setField('category_id')(event.target.value)}
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <Field
                        label="Descripción"
                        htmlFor="description"
                        error={fieldErrors.description}
                        hint="Opcional. Máximo 2000 caracteres."
                    >
                        <textarea
                            id="description"
                            rows={5}
                            className={inputClasses(Boolean(fieldErrors.description))}
                            value={form.description}
                            maxLength={2000}
                            onChange={(event) => setField('description')(event.target.value)}
                        />
                    </Field>

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                        <Link
                            to="/books"
                            className="inline-flex items-center rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear libro'}
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
