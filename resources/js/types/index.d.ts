
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    rol: 'admin' | 'profesor' | 'tutor';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
