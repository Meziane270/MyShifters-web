import { useCallback } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";

export default function ShiftFilters({
                                         statusFilter,
                                         onStatusChange,
                                         serviceFilter,
                                         onServiceChange
                                     }) {
    const handleStatusChange = useCallback((value) => {
        onStatusChange(value);
    }, [onStatusChange]);

    const handleServiceChange = useCallback((value) => {
        onServiceChange(value);
    }, [onServiceChange]);

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[220px] bg-background border-border text-foreground">
                    <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="open">Ouvertes</SelectItem>
                    <SelectItem value="filled">Pourvues</SelectItem>
                    <SelectItem value="completed">Terminées</SelectItem>
                    <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={handleServiceChange}>
                <SelectTrigger className="w-full sm:w-[220px] bg-background border-border text-foreground">
                    <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Tous les services</SelectItem>
                    <SelectItem value="reception">Réception</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="restaurant">Restauration</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}