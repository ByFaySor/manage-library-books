import type { ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    busy?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Eliminar',
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    onCancel();
                }
            }}
        >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
                    {title}
                </h2>
                <div className="mt-2 text-sm text-slate-600">{message}</div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onCancel} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={busy}>
                        {busy ? 'Eliminando…' : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
