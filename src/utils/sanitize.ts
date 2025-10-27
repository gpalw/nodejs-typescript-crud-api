import { User } from '@prisma/client';

export function sanitizeUser(user: User) {
    const safeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    return safeUser;
}