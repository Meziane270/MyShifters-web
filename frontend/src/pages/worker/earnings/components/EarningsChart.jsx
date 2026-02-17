// src/pages/worker/earnings/components/EarningsChart.jsx
import { useEffect, useRef } from "react";

export default function EarningsChart({ data = [] }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        // Simuler un graphique simple avec des barres
        const ctx = chartRef.current.getContext('2d');
        const width = chartRef.current.width;
        const height = chartRef.current.height;
        ctx.clearRect(0, 0, width, height);

        const months = data.map(d => d.month).slice(-6);
        const amounts = data.map(d => d.amount).slice(-6);
        const maxAmount = Math.max(...amounts, 1);

        const barWidth = (width - 60) / months.length - 10;

        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = 'hsl(var(--foreground) / 0.7)';
        ctx.textAlign = 'center';

        months.forEach((month, i) => {
            const barHeight = (amounts[i] / maxAmount) * (height - 80);
            const x = 40 + i * (barWidth + 10);
            const y = height - 40 - barHeight;

            // Barre
            ctx.fillStyle = 'hsl(var(--brand))';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Mois
            ctx.fillStyle = 'hsl(var(--foreground) / 0.7)';
            ctx.fillText(month, x + barWidth / 2, height - 20);

            // Montant
            ctx.fillStyle = 'hsl(var(--foreground))';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(`${amounts[i]} €`, x + barWidth / 2, y - 10);
        });
    }, [data]);

    if (!data.length) {
        return (
            <div className="h-64 flex items-center justify-center text-foreground/70">
                Aucune donnée disponible
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <canvas
                ref={chartRef}
                width={600}
                height={250}
                className="w-full h-full"
            />
        </div>
    );
}