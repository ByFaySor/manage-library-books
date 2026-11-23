import { cn } from '../lib/utils';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    onChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, total, onChange }: PaginationProps) {
    if (lastPage <= 1) {
        return (
            <p className="text-sm text-slate-500">
                {total} {total === 1 ? 'libro' : 'libros'}
            </p>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
                Página {currentPage} de {lastPage} · {total}{' '}
                {total === 1 ? 'libro' : 'libros'}
            </p>
            <div className="flex gap-2">
                <button
                    type="button"
                    className={cn(
                        'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-slate-300 ring-inset',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                    )}
                    disabled={currentPage <= 1}
                    onClick={() => onChange(currentPage - 1)}
                >
                    Anterior
                </button>
                <button
                    type="button"
                    className={cn(
                        'cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-slate-300 ring-inset',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                    )}
                    disabled={currentPage >= lastPage}
                    onClick={() => onChange(currentPage + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
