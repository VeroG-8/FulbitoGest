import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface ConfirmDialogProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    processing?: boolean;
    danger?: boolean;
}

export default function ConfirmDialog({
    show,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    processing = false,
    danger = false,
}: ConfirmDialogProps) {
    return (
        <Modal show={show} onClose={onCancel} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-bold text-slate-900">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {message}
                </p>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <SecondaryButton
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        {cancelText}
                    </SecondaryButton>

                    <PrimaryButton
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={
                            danger
                                ? '!bg-red-600 hover:!bg-red-700 focus:!bg-red-700'
                                : ''
                        }
                    >
                        {processing ? 'Procesando...' : confirmText}
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}