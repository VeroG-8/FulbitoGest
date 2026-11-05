import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactNode } from 'react';

import AuthenticatedLayout from './Layouts/AuthenticatedLayout';


const appName = import.meta.env.VITE_APP_NAME || 'FulbitoGest';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');
        const loadPage = pages[`./Pages/${name}.tsx`];

        if (!loadPage) {
            throw new Error(`No se encontró la página: ${name}`);
        }

        const module = (await loadPage()) as {
            default: ComponentType & {
                layout?: (page: ReactNode) => ReactNode;
            };
        };

        const page = module.default;

            const paginasPublicas = [
                'Auth/Login',
                'Auth/VerifyEmail',
                'Auth/ForgotPassword',
                'Auth/ResetPassword',
            ];

            if (!paginasPublicas.includes(name)) {
                page.layout =
                    page.layout ??
                    ((pageContent) => (
                        <AuthenticatedLayout>
                            {pageContent}
                        </AuthenticatedLayout>
                    ));
            }

            return page;
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: '#10B981',
    },
});