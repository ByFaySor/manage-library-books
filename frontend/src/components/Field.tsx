import type { ReactNode } from 'react';

export function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1 text-sm text-red-600" role="alert">
            {message}
        </p>
    );
}

interface FieldProps {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
    return (
        <div>
            <label
                className="mb-1 block text-sm font-medium text-slate-700"
                htmlFor={htmlFor}
            >
                {label}
                {required ? <span className="ml-0.5 text-red-500">*</span> : null}
            </label>
            {children}
            {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
            <FieldError message={error} />
        </div>
    );
}

export const inputClasses = (hasError: boolean): string =>
    [
        'block w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset',
        'placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm',
        hasError ? 'ring-red-400' : 'ring-slate-300',
    ].join(' ');
