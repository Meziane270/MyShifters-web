// src/pages/admin/disputes/components/DisputeFilters.jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

export default function DisputeFilters({ filters, onChange }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Filtrer par statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    value={filters.status}
                    onValueChange={(value) => onChange({ ...filters, status: value })}
                >
                    <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="open">Ouvert</SelectItem>
                        <SelectItem value="under_review">En cours</SelectItem>
                        <SelectItem value="resolved_hotel">Résolu (Hôtel)</SelectItem>
                        <SelectItem value="resolved_worker">Résolu (Worker)</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                        <SelectItem value="refunded">Remboursé</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}