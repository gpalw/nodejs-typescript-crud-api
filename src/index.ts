import 'dotenv/config';
import app from './app';
import { prisma } from './db/prisma';
import { hashPassword } from './utils/password';

const validateEnvVariables = () => {
    const requiredEnv = ['JWT_SECRET', 'DATABASE_URL', 'ADMIN_EMAIL', 'ADMIN_PASS'];
    const missingEnv = [];

    for (const envVar of requiredEnv) {
        if (!process.env[envVar]) {
            missingEnv.push(envVar);
        }
    }

    if (missingEnv.length > 0) {
        console.error(`FATAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
        process.exit(1);
    }
};


const ensureAdminExists = async () => {
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASS!;

    try {
        const admin = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!admin) {
            console.log(`Admin user '${email}' not found, creating one...`);

            const hashed = await hashPassword(password);

            await prisma.user.create({
                data: {
                    email: email,
                    password: hashed,
                    firstName: 'Default',
                    lastName: 'Admin',
                    role: 'admin' // Key part: set role to 'admin'
                    // Note: You may need to provide default values for other required fields in your model
                }
            });
            console.log(`Admin user '${email}' created successfully.`);
        } else {
            // If already exists
            console.log(`Admin user '${email}' already exists.`);
        }

    } catch (error) {
        // If database query fails, application startup will fail
        console.error("Failed to ensure admin user exists:", error);
        process.exit(1);
    }
};


const startServer = async () => {
    validateEnvVariables();
    await ensureAdminExists();

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
};

startServer();

