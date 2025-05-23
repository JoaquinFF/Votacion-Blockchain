import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const sessions = new Map();

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        sessions.set(socket.id, sessionId);
        console.log(`Cliente ${socket.id} unido a sesión ${sessionId}`);
    });

    socket.on('mobile-photos', (data) => {
        const sessionId = sessions.get(socket.id);
        if (sessionId) {
            io.to(sessionId).emit('photos-received', {
                dniImage: data.dniImage,
                selfieImage: data.selfieImage
            });
        }
    });

    socket.on('disconnect', () => {
        const sessionId = sessions.get(socket.id);
        if (sessionId) {
            sessions.delete(socket.id);
            console.log(`Cliente ${socket.id} desconectado de sesión ${sessionId}`);
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Servidor Socket.IO corriendo en puerto ${PORT}`);
}); 