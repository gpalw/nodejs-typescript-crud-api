import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { sanitizeUser } from '../utils/sanitize';
import jwt from 'jsonwebtoken';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { HttpError } from '../utils/errors';
import { UserQueryOptions } from '../types/user.types';
import { getPagination } from '../utils/pagination.utils';

export const userService = {
    async loginUser(email: string, plainPassword: string) {
        const user = await prisma.user.findFirst({
            where: { email: email, deletedAt: null },
        });
        if (!user) {
            throw new HttpError(401, 'Invalid email or password');
        }

        const valid = await verifyPassword(plainPassword, user.password);
        if (!valid) {
            throw new HttpError(401, 'Invalid credentials');
        }

        const payload = sanitizeUser(user);
        const secret = process.env.JWT_SECRET || 'YOUR_SECRET_KEY_REPLACE_THIS';

        const token = jwt.sign(payload, secret, {
            expiresIn: '1d',
        });
        return token;
    },


    async createUser(data: { firstName: string; lastName: string; email: string; password: string; }) {

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new HttpError(409, 'Email already exists');
        }

        const hashed = await hashPassword(data.password);
        const user = await prisma.user.create({ data: { firstName: data.firstName, lastName: data.lastName, email: data.email, password: hashed } });
        return sanitizeUser(user);
    },

    async getUsers(options: UserQueryOptions) {
        if (options.email) {
            const user = await prisma.user.findFirst({
                where: { email: options.email, deletedAt: null },
            });

            if (!user) {
                throw new HttpError(404, 'User not found');
            }
            return sanitizeUser(user);
        }

        // findMany
        const whereClause: any = {
            deletedAt: null, // Basic
        };

        if (options.firstName) {
            whereClause.firstName = {
                contains: options.firstName,
                mode: 'insensitive',
            };
        }

        if (options.lastName) {
            whereClause.lastName = {
                contains: options.lastName,
                mode: 'insensitive',
            };
        }

        const { page, limit, skip } = getPagination(options.pagination);
        const [users, totalUsers] = await prisma.$transaction([
            // first query
            prisma.user.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
            }),
            // second query
            prisma.user.count({
                where: whereClause,
            })
        ]);

        return {
            data: users.map(sanitizeUser),
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            }
        };
    },

    async updateUser(email: string, data: { firstName?: string; lastName?: string; email?: string }) {
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
