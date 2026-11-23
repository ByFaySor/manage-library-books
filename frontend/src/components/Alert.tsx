interface AlertProps {
    tone?: 'error' | 'info' | 'success';
    title?: string;
    children: React.ReactNode;
    onDismiss?: () => void;
}

const tones = {
    error: 'bg-red-50 text-red-800 ring-red-200',
    info: 'bg-sky-50 text-sky-800 ring-sky-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

export function Alert({ tone = 'error', title, children, onDismiss }: AlertProps) {
    return (
        <div
            className={`flex items-start justify-between gap-4 rounded-md px-4 py-3 text-sm ring-1 ring-inset ${tones[tone]}`}
            role="alert"
        >
            <div>
                {title ? <p className="font-semibold">{title}</p> : null}
                <div>{children}</div>
            </div>
            {onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="cursor-pointer text-xs font-medium underline"
                >
                    Cerrar
                </button>
            ) : null}
        </div>
    );
}
