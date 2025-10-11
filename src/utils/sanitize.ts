import { User } from '@prisma/client';

export function sanitizeUser(user: User) {
    const { password, deletedAt, ...safe } = user;
    return safe;
}