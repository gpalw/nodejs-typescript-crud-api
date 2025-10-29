// src/controllers/broadcast.controller.ts
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { HttpError } from '../utils/errors';
import { Server } from 'socket.io'; // Import the Server type so TypeScript knows what io is

export const broadcastController = {
    send: asyncHandler(async (req: Request, res: Response) => {
        const { message } = req.body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new HttpError(400, 'Message is required and must be a non-empty string');
        }

        // Safely obtain an io instance from the app
        const io = req.app.get('io') as Server;
        if (!io) {
            // If io doesn't exist, it means there's a server configuration issue
            console.error("Socket.IO server instance not found in app context!");
            throw new HttpError(500, 'Internal server error: Cannot send broadcast');
        }

        // Safely obtain the sender information from req.user (added by authMiddleware)
        const senderEmail = req.user?.email || 'Unknown Admin';

        // Broadcast to all connected clients
        io.emit('broadcast-message', {
            text: message.trim(),
            sender: senderEmail,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: 'Broadcast sent successfully' });
    })
};