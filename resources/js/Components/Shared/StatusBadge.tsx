interface StatusBadgeProps {
    status: string;
}

const statusStyles: Record<string, string> = {
    activo: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    activa: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    inscripto: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    finalizado: 'bg-slate-100 text-slate-700 ring-slate-600/20',

    pendiente: 'bg-amber-100 text-amber-700 ring-amber-600/20',

    inactivo: 'bg-red-100 text-red-700 ring-red-600/20',
    inactiva: 'bg-red-100 text-red-700 ring-red-600/20',
    cancelado: 'bg-red-100 text-red-700 ring-red-600/20',

    en_curso: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    programado: 'bg-violet-100 text-violet-700 ring-violet-600/20',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase().trim();

    const styles =
        statusStyles[normalizedStatus] ??
        'bg-slate-100 text-slate-600 ring-slate-500/20';

    const label = status.replaceAll('_', ' ');

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
        >
            {label}
        </span>
    );
}