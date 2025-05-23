import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Simulación de función de comparación (debes reemplazarla por tu lógica real)
async function compararConBD(selfieImage, dniImage) {
    // Aquí iría tu lógica de comparación biométrica
    // Por ahora, simulemos que siempre es exitosa:
    return true;
}

const sessions = new Map();

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('join-session', (sessionId) => {
        socket.join(sessionId);
        sessions.set(socket.id, sessionId);
        console.log(`Cliente ${socket.id} unido a sesión ${sessionId}`);
    });

    socket.on('mobile-photos', async (data) => {
        const sessionId = sessions.get(socket.id);
        if (sessionId) {
            // 1. Emitir las fotos a la PC (como ya tienes)
            io.to(sessionId).emit('photos-received', {
                dniImage: data.dniImage,
                selfieImage: data.selfieImage
            });

            // 2. Comparar la selfie con la BD
            const validacionExitosa = await compararConBD(data.selfieImage, data.dniImage);

            // 3. Notificar el resultado a la PC
            if (validacionExitosa) {
                console.log('Validación exitosa');
                io.to(sessionId).emit('validation-success');
            } else {
                console.log('Validación fallida');
                io.to(sessionId).emit('validation-failed');
            }
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