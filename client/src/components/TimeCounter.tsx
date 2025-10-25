import { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';

interface TimeCounterProps {
    fechaFin?: string; // ISO format: "2025-10-31T23:59:59Z"
    campaignId?: number;
}

const TimeCounter = ({ fechaFin, campaignId }: TimeCounterProps) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);
    const [variant, setVariant] = useState<'success' | 'warning' | 'danger' | 'secondary'>('success');

    useEffect(() => {
        const calculateTimeRemaining = () => {
            if (!fechaFin) {
                setTimeRemaining('Fecha no disponible');
                return;
            }

            const now = new Date();
            const endDate = new Date(fechaFin);
            const diffMs = endDate.getTime() - now.getTime();

            if (diffMs <= 0) {
                setIsExpired(true);
                setVariant('secondary');
                setTimeRemaining('Votación cerrada');
                return;
            }

            setIsExpired(false);

            // Convertir a unidades
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);

            let displayText = '';
            let bgVariant: 'success' | 'warning' | 'danger' | 'secondary' = 'success';

            if (diffMonths > 0) {
                // Más de 1 mes: mostrar días
                displayText = `${diffDays} día${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`;
                bgVariant = 'success';
            } else if (diffDays > 0) {
                // Entre 1 y 30 días: mostrar días y horas
                const remainingHours = diffHours % 24;
                displayText = `${diffDays}d ${remainingHours}h`;
                bgVariant = diffDays < 3 ? 'warning' : 'success';
            } else if (diffHours > 0) {
                // Entre 1 y 24 horas: mostrar horas y minutos
                const remainingMins = diffMins % 60;
                displayText = `${diffHours}h ${remainingMins}m`;
                bgVariant = 'warning';
            } else if (diffMins > 0) {
                // Entre 1 y 60 minutos: mostrar minutos y segundos
                const remainingSecs = diffSecs % 60;
                displayText = `${diffMins}m ${remainingSecs}s`;
                bgVariant = 'danger';
            } else {
                // Menos de 1 minuto: mostrar segundos
                displayText = `${diffSecs}s`;
                bgVariant = 'danger';
            }

            setTimeRemaining(displayText);
            setVariant(bgVariant);
        };

        // Calcular inmediatamente
        calculateTimeRemaining();

        // Actualizar cada segundo
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [fechaFin]);

    return (
        <Badge bg={variant} className="font-weight-bold">
            {isExpired ? '❌ ' : '⏱️ '}
            {timeRemaining}
        </Badge>
    );
};

export default TimeCounter;
