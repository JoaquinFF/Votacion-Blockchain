import dbConnect from '../../utils/dbConnect';
import { Usuario } from '../../models/Usuario';
import * as faceapi from 'face-api.js';
import { initializeSocket, getSocketIO } from './socket.js';

export async function post({ request, locals }) {
    try {
        // Conectar a MongoDB
        await dbConnect();
        
        const { dni, selfieImage, sessionId } = await request.json();

        if (!dni || !selfieImage || !sessionId) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Faltan datos requeridos'
            }), {
                status: 400
            });
        }

        // Inicializar Socket.IO si es necesario
        let io = getSocketIO();
        if (!io) {
            // En Vercel, esto podría no funcionar perfectamente, 
            // pero para desarrollo local debería estar bien
            console.log('Socket.IO no está inicializado');
        }

        // Buscar usuario por DNI
        const usuario = await Usuario.findOne({ dni });
        
        if (!usuario) {
            // Notificar a la PC que el DNI no fue encontrado
            if (io) {
                io.to(sessionId).emit('validation-result', {
                    success: false,
                    message: 'DNI no encontrado en la base de datos',
                    type: 'dni-not-found'
                });
            }

            return new Response(JSON.stringify({
                success: false,
                message: 'DNI no encontrado en la base de datos'
            }), {
                status: 404
            });
        }

        // Validar que el usuario tenga descriptor facial
        if (!usuario.descriptorFacial) {
            if (io) {
                io.to(sessionId).emit('validation-result', {
                    success: false,
                    message: 'Usuario no tiene descriptor facial registrado',
                    type: 'no-face-descriptor'
                });
            }

            return new Response(JSON.stringify({
                success: false,
                message: 'Usuario no tiene descriptor facial registrado'
            }), {
                status: 400
            });
        }

        // Obtener descriptor facial de la selfie
        const img = await faceapi.fetchImage(selfieImage);
        const detections = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detections) {
            // Notificar a la PC que no se detectó rostro
            if (io) {
                io.to(sessionId).emit('validation-result', {
                    success: false,
                    message: 'No se detectó un rostro en la selfie',
                    type: 'no-face-detected'
                });
            }

            return new Response(JSON.stringify({
                success: false,
                message: 'No se detectó un rostro en la selfie'
            }), {
                status: 400
            });
        }

        // Comparar con el descriptor facial almacenado
        const distance = faceapi.euclideanDistance(
            detections.descriptor,
            new Float32Array(usuario.descriptorFacial)
        );

        const isValid = distance <= 0.6;

        // Notificar resultado a la PC
        if (io) {
            io.to(sessionId).emit('validation-result', {
                success: isValid,
                message: isValid ? 'Validación exitosa' : 'La validación facial falló. Las fotos no corresponden a la misma persona.',
                type: isValid ? 'validation-success' : 'validation-failed',
                userData: isValid ? {
                    nombre: usuario.nombre,
                    dni: usuario.dni,
                    // No enviamos datos sensibles
                } : null,
                distance: distance
            });
        }

        return new Response(JSON.stringify({
            success: isValid,
            message: isValid ? 'Validación exitosa' : 'La validación facial falló. Las fotos no corresponden a la misma persona.',
            userData: isValid ? {
                nombre: usuario.nombre,
                dni: usuario.dni
            } : null
        }), {
            status: isValid ? 200 : 400
        });

    } catch (error) {
        console.error('Error en la validación:', error);
        
        // Notificar error a la PC
        const io = getSocketIO();
        if (io && sessionId) {
            io.to(sessionId).emit('validation-result', {
                success: false,
                message: 'Error en el servidor durante la validación',
                type: 'server-error'
            });
        }

        return new Response(JSON.stringify({
            success: false,
            message: 'Error en el servidor'
        }), {
            status: 500
        });
    }
}

// Para manejar la configuración del socket en Astro
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
} 