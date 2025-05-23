import mongoose from 'mongoose';
import { Usuario } from '../../models/Usuario';
import * as faceapi from 'face-api.js';

const MONGODB_URI = 'mongodb+srv://Admin:root@cluster0.twf04.mongodb.net/';

export async function post({ request }) {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        
        const { dni, selfieImage } = await request.json();

        // Buscar usuario por DNI
        const usuario = await Usuario.findOne({ dni });
        
        if (!usuario) {
            return new Response(JSON.stringify({
                success: false,
                message: 'DNI no encontrado en la base de datos'
            }), {
                status: 404
            });
        }

        // Obtener descriptor facial de la selfie
        const img = await faceapi.fetchImage(selfieImage);
        const detections = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detections) {
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

        if (distance > 0.6) {
            return new Response(JSON.stringify({
                success: false,
                message: 'La validación facial falló. Las fotos no corresponden a la misma persona.'
            }), {
                status: 400
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Validación exitosa'
        }), {
            status: 200
        });

    } catch (error) {
        console.error('Error en la validación:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error en el servidor'
        }), {
            status: 500
        });
    } finally {
        await mongoose.disconnect();
    }
} 