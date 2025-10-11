import { z } from 'zod';

// (?=.*[a-z])  one lower case
// (?=.*[A-Z])  one upper case
// (?=.*\d)  one number
// (?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])  one special character
// .{8,30}$ between 8 and 30 character
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,30}$/;

// Create User
export const createUserSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    password: z
        .string()
        .regex(
            PASSWORD_REGEX,
            'Password must be 8–30 chars, include upper, lower, number & special char'
        ),
});

// Update User
export const updateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
});
