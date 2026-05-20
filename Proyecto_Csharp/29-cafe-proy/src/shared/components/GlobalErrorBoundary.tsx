'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    errorType: 'offline' | 'service_unavailable' | 'unknown' | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorType: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Analizamos el mensaje de error que podría venir del apiClient
        if (error.message.includes('503') || error.message.includes('Service Unavailable') || error.message.includes('servicio crítico')) {
            return { hasError: true, errorType: 'service_unavailable' };
        }
        if (error.message.includes('No se pudo conectar')) {
            return { hasError: true, errorType: 'offline' };
        }
        return { hasError: true, errorType: 'unknown' };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                        <div className="text-6xl mb-4">
                            {this.state.errorType === 'service_unavailable' ? '🚧' : '🔌'}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {this.state.errorType === 'service_unavailable' 
                                ? 'Sistema en Mantenimiento' 
                                : 'Problemas de Conexión'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {this.state.errorType === 'service_unavailable'
                                ? 'Nuestros servidores o la base de datos están experimentando dificultades. Por favor, intenta de nuevo más tarde.'
                                : 'No podemos comunicarnos con el servidor. Verifica tu conexión a internet.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full"
                        >
                            Intentar de Nuevo
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
