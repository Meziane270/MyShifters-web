// src/pages/admin/users/components/UserFilters.jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

export default function UserFilters({ filters, onChange }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-foreground/60 mb-1 block">Rôle</label>
                    <Select
                        value={filters.role}
                        onValueChange={(value) => onChange({ ...filters, role: value })}
                    >
                        <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Tous les rôles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="hotel">Hôtels</SelectItem>
                            <SelectItem value="worker">Workers</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-xs text-foreground/60 mb-1 block">Statut vérification</label>
                    <Select
                        value={filters.verification}
                        onValueChange={(value) => onChange({ ...filters, verification: value })}
                    >
                        <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="verified">Vérifiés</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="unverified">Non vérifiés</SelectItem>
                            <SelectItem value="rejected">Rejetés</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}