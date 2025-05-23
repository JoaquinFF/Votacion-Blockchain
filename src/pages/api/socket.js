import { Server } from 'socket.io';

let io;

export async function GET({ request, locals }) {
    return new Response('Socket.IO endpoint', { status: 200 });
}

export async function POST({ request, locals }) {
    return new Response('Socket.IO endpoint', { status: 200 });
}

// Función para inicializar Socket.IO (será llamada desde otros endpoints)
export function initializeSocket(server) {
    if (!server.io) {
        console.log('Inicializando Socket.IO...');
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling']
        });

        io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            socket.on('join-session', (sessionId) => {
                console.log('Cliente se unió a sesión:', sessionId);
                socket.join(sessionId);
            });

            socket.on('mobile-photos', (data) => {
                console.log('Fotos recibidas desde móvil');
                // Reenviar a la PC
                socket.broadcast.emit('photos-received', data);
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });

        server.io = io;
    }
    return server.io;
}

export function getSocketIO() {
    return io;
} 