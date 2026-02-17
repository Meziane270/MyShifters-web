import { useMemo } from "react";

export default function StatsCards({ stats }) {
    const cards = useMemo(() => [
        {
            label: "Missions totales",
            value: stats?.total_shifts || 0,
            color: "text-brand"
        },
        {
            label: "Missions ouvertes",
            value: stats?.open_shifts || 0,
            color: "text-emerald-600 dark:text-emerald-400"
        },
        {
            label: "Missions pourvues",
            value: stats?.filled_shifts || 0,
            color: "text-blue-600 dark:text-blue-400"
        },
        {
            label: "Candidatures en attente",
            value: stats?.pending_applications || 0,
            color: "text-orange-600 dark:text-orange-400"
        }
    ], [stats]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="p-6 bg-card rounded-xl border border-border"
                >
                    <div className={`text-3xl font-display font-bold ${card.color} mb-1`}>
                        {card.value}
                    </div>
                    <div className="text-foreground/70 text-sm">
                        {card.label}
                    </div>
                </div>
            ))}
        </div>
    );
}