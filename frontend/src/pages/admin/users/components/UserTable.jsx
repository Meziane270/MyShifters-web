// src/pages/admin/users/components/UserTable.jsx
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import StatusPill from "../../components/StatusPill";
import {
    User,
    Building2,
    Briefcase,
    Shield,
    AlertCircle
} from "lucide-react";

export default function UserTable({ users, loading, pagination, onPageChange }) {
    const navigate = useNavigate();

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4" />;
            case 'hotel': return <Building2 className="w-4 h-4" />;
            case 'worker': return <Briefcase className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'hotel': return 'Hôtel';
            case 'worker': return 'Worker';
            default: return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-card rounded-xl border border-border">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-foreground/70">Utilisateur</TableHead>
                        <TableHead className="text-foreground/70">Rôle</TableHead>
                        <TableHead className="text-foreground/70">Vérification</TableHead>
                        <TableHead className="text-foreground/70">Inscription</TableHead>
                        <TableHead className="text-foreground/70">Statut</TableHead>
                        <TableHead className="text-foreground/70 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-foreground/70">
                                Aucun utilisateur trouvé
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.id} className="border-border">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                                            {getRoleIcon(user.role)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {user.role === 'hotel' ? user.hotel_name || user.name : user.name}
                                            </div>
                                            <div className="text-xs text-foreground/60">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-border">
                                        {getRoleLabel(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <StatusPill status={user.verification_status} />
                                </TableCell>
                                <TableCell className="text-foreground/70">
                                    {formatDistanceToNow(new Date(user.created_at), {
                                        addSuffix: true,
                                        locale: fr
                                    })}
                                </TableCell>
                                <TableCell>
                                    {user.is_suspended ? (
                                        <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-0">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Suspendu
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">
                                            Actif
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-border"
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                    >
                                        Voir profil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                    <div className="text-sm text-foreground/70">
                        Page {pagination.page} sur {pagination.pages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            disabled={pagination.page === 1}
                            onClick={() => onPageChange(pagination.page - 1)}
                        >
                            Précédent
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => onPageChange(pagination.page + 1)}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}