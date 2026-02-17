import { Link } from "react-router-dom";
import { useCallback } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
    CalendarDays,
    Clock,
    Euro,
    Users,
    XCircle
} from "lucide-react";

const SERVICE_LABELS = {
    reception: "Réception",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    restaurant: "Restauration",
};

const SERVICE_COLORS = {
    reception: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    housekeeping: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    maintenance: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    restaurant: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

export default function ShiftCard({ shift, onDelete, canAct, isBlocked }) {
    const handleDelete = useCallback(() => {
        onDelete(shift.id);
    }, [shift.id, onDelete]);

    return (
        <div
            className="p-6 bg-card rounded-xl border border-border hover:border-brand/30 transition-colors"
            data-testid={`shift-card-${shift.id}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${SERVICE_COLORS[shift.service_type]}`}>
                            {SERVICE_LABELS[shift.service_type]}
                        </span>

                        <Badge
                            className={
                                shift.status === "open"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"
                                    : shift.status === "filled"
                                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0"
                                        : "bg-foreground/10 text-foreground/70 border-0"
                            }
                        >
                            {shift.status === "open" ? "Ouvert" :
                                shift.status === "filled" ? "Pourvu" :
                                    shift.status === "completed" ? "Terminée" :
                                        shift.status === "cancelled" ? "Annulée" : shift.status}
                        </Badge>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {shift.title}
                    </h3>

                    <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                        {shift.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-foreground/70">
                            <CalendarDays className="w-4 h-4 text-brand" />
                            {shift.date}
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70">
                            <Clock className="w-4 h-4 text-brand" />
                            {shift.start_time} - {shift.end_time}
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70">
                            <Euro className="w-4 h-4 text-brand" />
                            {shift.hourly_rate}€/h
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70">
                            <Users className="w-4 h-4 text-brand" />
                            {shift.positions_filled}/{shift.positions_available} postes
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link to={`/hotel/applications?shift=${shift.id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-foreground/25 text-foreground hover:bg-foreground/5"
                        >
                            Candidatures
                        </Button>
                    </Link>

                    {shift.status === "open" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={handleDelete}
                            disabled={!canAct || isBlocked}
                            data-testid={`delete-shift-${shift.id}`}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}