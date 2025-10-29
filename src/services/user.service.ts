import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { sanitizeUser } from '../utils/sanitize';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors';
import { UserQueryOptions } from '../types/user.types';
import { getPagination } from '../utils/pagination.utils';
import { User } from '@prisma/client';
import { UserPayload } from '../types/auth.types';

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

        const payload: UserPayload = {
            id: user.id,
            email: user.email,
            termsId: user.termsId,
            role: user.role,
        };
        const secret = process.env.JWT_SECRET!;

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

    async updateUser(email: string, data: { firstName?: string; lastName?: string; email?: string; termId?: string; }) {
        const allowed = ['firstName', 'lastName', 'email', 'termId'] as const;
        const keys = Object.keys(data);
        if (keys.length === 0) throw new HttpError(400, 'No updatable fields provided');
        if (keys.some(k => !allowed.includes(k as any))) {
            const allowedKeysString = allowed.join(', ');
            throw new HttpError(400, `Only ${allowedKeysString} can be updated`);
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

        // Terms and Conditions handling
        const validTermId = await validateAndFetchTerms(user, data.termId ?? null);
        if (validTermId) {
            updates.termsId = validTermId;
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

    async createDemoUsers(count: number) {
        const usersToCreate = [];

        const batchId = Math.random().toString(36).substring(2, 8); // demo "a4f8de"
        const hashed = await hashPassword(`Password123!`);
        for (let i = 0; i < count; i++) {
            const email = `demo_${batchId}_${i + 1}@liangwendev.com`;

            usersToCreate.push({
                firstName: 'Demo',
                lastName: `User ${batchId}-${i + 1}`,
                email: email,
                password: hashed,
                role: 'user'
            });
        }

        try {
            const createOperations = usersToCreate.map(user =>
                prisma.user.create({ data: user })
            );

            const newUsers = await prisma.$transaction(createOperations);

            return { success: true, count: newUsers.length };

        } catch (error) {
            console.error("Batch creation failed:", error);
            throw new HttpError(409, 'Batch creation failed, possible duplicate email.');
        }
    },

};
async function validateAndFetchTerms(user: User, newTermId: string | null) {
    if (newTermId === undefined || newTermId === null || user.termsId === newTermId) {
        return null;
    }

    if (newTermId.trim() === '') {
        throw new HttpError(400, 'Term ID cannot be empty');
    }

    const newTermsPromise = prisma.terms.findUnique({
        where: { id: newTermId }
    });

    const currentTermsPromise = user.termsId
        ? prisma.terms.findUnique({ where: { id: user.termsId } })
        : Promise.resolve(null);

    const [newTerms, currentTerms] = await Promise.all([
        newTermsPromise,
        currentTermsPromise
    ]);

    if (!newTerms) {
        throw new HttpError(404, `Terms with ID ${newTermId} not found`);
    }
    if (user.termsId && !currentTerms) {
        throw new HttpError(404, `User's current Terms (ID: ${user.termsId}) not found in database`);
    }

    if (currentTerms) {
        // Comparing versions is only required if the user currently has the clause
        if (newTerms.version <= currentTerms.version) {
            throw new HttpError(400, `The new terms (v${newTerms.version}) are not newer than the current terms (v${currentTerms.version}).`);
        }
    }
    return newTerms.id;
}

