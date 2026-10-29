import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: ReactNode;
    actions?: ReactNode;
}

export default function PageHeader({
    title,
    description,
    icon,
    actions,
}: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl !bg-slate-950 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl !bg-slate-800 text-white">
                    {icon}
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {title}
                    </h1>

                    <p className="mt-1 text-sm text-slate-300">
                        {description}
                    </p>
                </div>
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}