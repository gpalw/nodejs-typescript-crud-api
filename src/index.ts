import 'dotenv/config';
import http from 'http';
import app from './app';
import jwt from 'jsonwebtoken';
import { prisma } from './db/prisma';
import { hashPassword } from './utils/password';
import { Server } from 'socket.io';
import { UserPayload } from './types/auth.types';

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

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow connections from all sources
            methods: ["GET", "POST"]
        }
    });
    app.set('io', io);

    // WebSocket logic
    io.on('connection', (socket) => {
        console.log(`WebSocket connected: ${socket.id}`);

        // Try to authenticate user
        try {
            const token = socket.handshake.auth.token; // Get the Token sent by the front end
            if (!token) throw new Error('No token provided');

            const secret = process.env.JWT_SECRET!;
            const payload = jwt.verify(token, secret) as UserPayload; // Verify Token

            // Authentication is successful and user information is stored in the socket.
            socket.data.email = payload.email;
            console.log(`User authenticated for socket ${socket.id}: ${socket.data.email}`);

            // Broadcast 'user-connected' event to everyone
            io.emit('user-connected', { email: socket.data.email, timestamp: new Date() });

        } catch (error) {
            // Authentication failed
            console.error(`WebSocket Auth Error for ${socket.id}:`, (error as Error).message);
            socket.disconnect(true); // Forcefully disconnect this invalid connection
            return; // End this socket's handling
        }

        // Handle disconnection events
        socket.on('disconnect', () => {
            console.log(`WebSocket disconnected: ${socket.id}, User: ${socket.data.email}`);
            if (socket.data.email) { // Ensure it's a verified user disconnecting
                // Broadcast 'user-disconnected' event to everyone
                io.emit('user-disconnected', { email: socket.data.email, timestamp: new Date() });
            }
        });

    });


    const port = Number(process.env.PORT) || 3000;
    server.listen(port, () => { //  Use server.listen instead of app.listen
        console.log(`Server listening on http://localhost:${port}`);
    });

};

startServer();

