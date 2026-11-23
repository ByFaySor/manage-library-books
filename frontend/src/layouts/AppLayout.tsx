import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

const links = [
    { to: '/books', label: 'Libros' },
    { to: '/categories', label: 'Categorías' },
];

export function AppLayout() {
    return (
        <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-lg font-bold text-white">
                            B
                        </span>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                Biblioteca de libros
                            </p>
                            <p className="text-xs text-slate-500">
                                Gestión de libros y categorías
                            </p>
                        </div>
                    </div>
                    <nav className="flex gap-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    cn(
                                        'rounded-md px-3 py-2 text-sm font-medium transition',
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-100',
                                    )
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
