// src/types/auth.types.ts
export interface UserPayload {
    id: string;
    email: string;
    termsId: string | null;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}