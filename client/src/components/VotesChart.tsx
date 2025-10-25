import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
import '../styles/components/VotesChart.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Candidate {
    id: number;
    nombre: string;
    voteCount: number;
}

interface VotesChartProps {
    candidates: Candidate[];
    campañaTitulo: string;
    chartType?: 'bar' | 'pie';
}

const VotesChart: React.FC<VotesChartProps> = ({ candidates, campañaTitulo, chartType = 'bar' }) => {
    // Debug: verificar que recibimos datos
    console.log('VotesChart recibió:', { candidates, campañaTitulo, chartType });

    if (!candidates || candidates.length === 0) {
        console.warn('VotesChart: Sin candidatos para mostrar');
        return (
            <Card className="mb-4 chart-card">
                <Card.Body>
                    <div className="text-center text-muted py-5">
                        <p>No hay candidatos o votos para mostrar</p>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // Preparar datos para el gráfico
    const labels = candidates.map(c => c.nombre);
    const data = candidates.map(c => c.voteCount);
    
    // Colores SIA
    const primaryColors = ['#001a4d', '#F4A500', '#0056b3', '#FFD700', '#003d7a', '#FFB84D'];
    const backgroundColors = data.map((_, index) => primaryColors[index % primaryColors.length]);
    const borderColors = backgroundColors.map(color => color);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Votos por Candidato',
                data,
                backgroundColor: chartType === 'pie' ? backgroundColors : '#001a4d',
                borderColor: chartType === 'pie' ? borderColors : '#F4A500',
                borderWidth: 2,
                borderRadius: 5,
            },
        ],
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    font: { size: 12, weight: 'bold' },
                    padding: 15,
                    color: '#333',
                },
            },
            title: {
                display: true,
                text: `${chartType === 'bar' ? 'Resultados' : 'Distribución'} - ${campañaTitulo}`,
                font: { size: 14, weight: 'bold' },
                color: '#001a4d',
                padding: { bottom: 20 },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 26, 77, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#F4A500',
                borderWidth: 1,
                padding: 10,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11 },
                callbacks: {
                    label: function(context: any) {
                        let label = context.label || '';
                        if (chartType === 'bar' && context.parsed.y !== null) {
                            label += `: ${context.parsed.y} voto${context.parsed.y !== 1 ? 's' : ''}`;
                        } else if (chartType === 'pie' && context.parsed !== null) {
                            label += `: ${context.parsed} voto${context.parsed !== 1 ? 's' : ''}`;
                        }
                        return label;
                    },
                },
            },
        },
        scales: chartType === 'bar' ? {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#666',
                    font: { size: 11 },
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                },
            },
            x: {
                ticks: {
                    color: '#666',
                    font: { size: 11 },
                },
                grid: {
                    display: false,
                },
            },
        } : {},
    };

    return (
        <Card className="mb-4 chart-card">
            <Card.Body>
                <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                    {chartType === 'bar' ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <Pie data={chartData} options={chartOptions} />
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default VotesChart;
