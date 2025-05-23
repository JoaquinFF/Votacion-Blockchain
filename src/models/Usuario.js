import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    dni: {
        type: String,
        required: true,
        unique: true
    },
    fotoPerfil: {
        type: String,
        required: true
    },
    descriptorFacial: {
        type: Array,
        required: true
    }
});

export const Usuario = mongoose.model('Usuario', usuarioSchema); 