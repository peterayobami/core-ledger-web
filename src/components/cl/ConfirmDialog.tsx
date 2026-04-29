import * as React from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    body: string;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel = "Delete", loading, onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 cl-backdrop-enter" style={{ backgroundColor: "rgba(0,0,0,0.40)" }} onClick={onCancel} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-base font-semibold text-[var(--cl-text)]">{title}</h3>
                <p className="text-sm text-[var(--cl-text-muted)] mt-2 leading-relaxed">{body}</p>
                <div className="mt-5 flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
                    <Button variant="dangerFilled" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    );
}
