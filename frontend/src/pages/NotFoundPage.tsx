import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <div className="py-20 text-center">
            <p className="text-sm font-semibold text-indigo-600">404</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Página no encontrada</h1>
            <Link
                to="/books"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
                Volver a los libros
            </Link>
        </div>
    );
}
