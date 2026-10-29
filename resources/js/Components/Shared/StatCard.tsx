import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: ReactNode;
    color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
}

const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
};

export default function StatCard({
    title,
    value,
    description,
    icon,
    color = 'blue',
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 text-xs text-slate-500">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorStyles[color]}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}