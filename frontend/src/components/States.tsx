export function TableSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-2" aria-label="Cargando">
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} className="h-12 rounded-md bg-slate-200/70" />
            ))}
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>
            {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
        </div>
    );
}
