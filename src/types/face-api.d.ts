declare module 'face-api.js' {
    export const nets: {
        ssdMobilenetv1: {
            loadFromUri: (uri: string) => Promise<void>;
        };
        faceLandmark68Net: {
            loadFromUri: (uri: string) => Promise<void>;
        };
        faceRecognitionNet: {
            loadFromUri: (uri: string) => Promise<void>;
        };
    };
    export function detectSingleFace(img: HTMLImageElement): {
        withFaceLandmarks: () => {
            withFaceDescriptor: () => Promise<{
                descriptor: Float32Array;
            }>;
        };
    };
    export function fetchImage(url: string): Promise<HTMLImageElement>;
    export function euclideanDistance(desc1: Float32Array, desc2: Float32Array): number;
} 