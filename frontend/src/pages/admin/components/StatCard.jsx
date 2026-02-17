// src/pages/admin/components/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, trend }) {
    return (
        <div className="p-6 bg-card rounded-xl border border-border">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-3xl font-display font-bold text-foreground mb-1">
                        {value}
                    </div>
                    <div className="text-foreground/70 text-sm">{label}</div>
                </div>
                {Icon && <Icon className="w-8 h-8 text-foreground/30" />}
            </div>
            {trend !== undefined && (
                <div className={`mt-2 text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}% vs mois dernier
                </div>
            )}
        </div>
    );
}