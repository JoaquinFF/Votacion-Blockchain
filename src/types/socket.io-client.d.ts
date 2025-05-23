declare module 'socket.io-client' {
    export function io(url: string): {
        on: (event: string, callback: (data?: any) => void) => void;
        emit: (event: string, data?: any) => void;
    };
} 