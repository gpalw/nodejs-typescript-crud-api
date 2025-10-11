import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { sanitizeUser } from '../utils/sanitize';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { HttpError } from '../utils/errors';

export const userService = {
    async createUser(data: { firstName: string; lastName: string; email: string; password: string; }) {

        const parsed = createUserSchema.safeParse(data);
        if (!parsed.success) {
            const message = parsed.error.issues.map(i => i.message).join(', ');
            throw new HttpError(400, message);
        }

        const { firstName, lastName, email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new HttpError(409, 'Email already exists');
        }

        const hashed = await hashPassword(password);
        const user = await prisma.user.create({ data: { firstName, lastName, email, password: hashed } });
        return sanitizeUser(user);
    },

    async getUsers(email?: string) {
        if (email) {
            const user = await prisma.user.findFirst({
                where: { email, deletedAt: null },
            });

            if (!user) {
                throw new HttpError(404, 'User not found');
            }
            return sanitizeUser(user);
        }
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
        });
        return users.map(sanitizeUser);
    },

    async updateUser(email: string, data: { firstName?: string; lastName?: string; email?: string }) {
        const parsed = updateUserSchema.safeParse(data);
        if (!parsed.success) {
            const message = parsed.error.issues.map(i => i.message).join(', ');
            throw new HttpError(400, message);
        }

        const allowed = ['firstName', 'lastName', 'email'] as const;
        const keys = Object.keys(data);
        if (keys.length === 0) throw new HttpError(400, 'No updatable fields provided');
        if (keys.some(k => !allowed.includes(k as any))) {
            throw new HttpError(400, 'Only firstName, lastName, email can be updated');
        }

        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) throw new HttpError(404, 'User not found');

        const updates: any = {};
        if (data.firstName !== undefined) {
            if (data.firstName.trim() === '') {
                throw new HttpError(400, 'First name cannot be empty');
            }
            updates.firstName = data.firstName;
        }
        if (data.lastName !== undefined) {
            if (data.lastName.trim() === '') {
                throw new HttpError(400, 'Last name cannot be empty');
            }
            updates.lastName = data.lastName;
        }
        if (data.email !== undefined && data.email !== user.email) {
            const exists = await prisma.user.findUnique({ where: { email: data.email } });
            if (exists) {
                throw new HttpError(409, 'New email already exists');
            }
            updates.email = data.email;
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: updates,
        });
        return sanitizeUser(updated);
    },

    async deleteUser(email: string, plainPassword: string) {
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) {
            throw new HttpError(404, 'User not found');
        }

        const valid = await verifyPassword(plainPassword, user.password);
        if (!valid) {
            throw new HttpError(401, 'Invalid password');
        }

        const deleted = await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: new Date() },
        });
        return sanitizeUser(deleted);
    },
};
