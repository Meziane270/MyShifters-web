// src/pages/admin/audit/AdminAuditLog.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../../../components/ui/table";
import {
    RefreshCw,
    Search,
    Filter,
    Download,
    UserCheck,
    UserX,
    Ban,
    Key,
    CheckCircle,
    XCircle,
    FileText,
    Settings
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const actionIcons = {
    user_verified: UserCheck,
    user_rejected: UserX,
    user_suspended: Ban,
    user_banned: Ban,
    user_unbanned: UserCheck,
    password_reset_admin: Key,
    dispute_resolved: CheckCircle,
    review_deleted: XCircle,
    review_hidden: XCircle,
    invoice_generated: FileText,
    settings_updated: Settings
};

const actionLabels = {
    user_verified: "Utilisateur vérifié",
    user_rejected: "Utilisateur rejeté",
    user_suspended: "Utilisateur suspendu",
    user_banned: "Utilisateur banni",
    user_unbanned: "Suspension levée",
    password_reset_admin: "Mot de passe réinitialisé",
    dispute_resolved: "Litige résolu",
    review_deleted: "Avis supprimé",
    review_hidden: "Avis masqué",
    invoice_generated: "Facture générée",
    settings_updated: "Paramètres modifiés"
};

export default function AdminAuditLog() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        pages: 0
    });
    const [filters, setFilters] = useState({
        action: "",
        target_type: "",
        admin_id: "",
        search: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...filters
            };
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const res = await axios.get(`${API}/admin/audit`, {
                headers: getAuthHeader(),
                params
            });
            setLogs(res.data.logs || []);
            setPagination({
                total: res.data.total,
                page: res.data.page,
                limit: res.data.limit,
                pages: res.data.pages
            });
        } catch (e) {
            toast.error("Impossible de charger le journal d'audit");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, pagination.limit, filters]); // ← DÉPENDANCES
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            const res = await axios.get(`${API}/admin/audit/export`, {
                headers: getAuthHeader(),
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error("Erreur lors de l'export");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Journal d'audit
                    </h1>
                    <p className="text-foreground/70">
                        {pagination.total} action{pagination.total > 1 ? 's' : ''} enregistrée{pagination.total > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={() => fetchLogs(pagination.page)}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Search and filters */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                        <Input
                            placeholder="Rechercher par admin, utilisateur, ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-9 bg-background border-border"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className={`border-border ${showFilters ? 'bg-brand/10 text-brand' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                    </Button>
                </div>

                {showFilters && (
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="text-sm font-medium text-foreground mb-3">Filtres avancés</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-foreground/60 mb-1 block">Type d'action</label>
                                <Select
                                    value={filters.action}
                                    onValueChange={(value) => setFilters({ ...filters, action: value })}
                                >
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Toutes les actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes</SelectItem>
                                        <SelectItem value="user_verified">Vérifications</SelectItem>
                                        <SelectItem value="user_suspended">Suspensions</SelectItem>
                                        <SelectItem value="password_reset_admin">Mots de passe</SelectItem>
                                        <SelectItem value="dispute_resolved">Litiges</SelectItem>
                                        <SelectItem value="review_deleted">Avis</SelectItem>
                                        <SelectItem value="settings_updated">Paramètres</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs text-foreground/60 mb-1 block">Type de cible</label>
                                <Select
                                    value={filters.target_type}
                                    onValueChange={(value) => setFilters({ ...filters, target_type: value })}
                                >
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Tous les types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="user">Utilisateur</SelectItem>
                                        <SelectItem value="dispute">Litige</SelectItem>
                                        <SelectItem value="review">Avis</SelectItem>
                                        <SelectItem value="invoice">Facture</SelectItem>
                                        <SelectItem value="settings">Paramètres</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Audit table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-foreground/70">Date</TableHead>
                            <TableHead className="text-foreground/70">Admin</TableHead>
                            <TableHead className="text-foreground/70">Action</TableHead>
                            <TableHead className="text-foreground/70">Cible</TableHead>
                            <TableHead className="text-foreground/70">Détails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-foreground/70">
                                    Aucune action enregistrée
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => {
                                const Icon = actionIcons[log.action] || FileText;
                                return (
                                    <TableRow key={log.id} className="border-border">
                                        <TableCell className="text-foreground/70 whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-brand">
                                                        {log.admin_email?.[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-foreground">
                                                    {log.admin_email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-foreground/70" />
                                                <span className="text-sm text-foreground">
                                                    {actionLabels[log.action] || log.action}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="text-foreground/50 capitalize">
                                                    {log.target_type}
                                                </span>
                                                <span className="text-foreground ml-2 font-mono text-xs">
                                                    #{log.target_id.slice(-8)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div className="text-xs text-foreground/70">
                                                    {Object.entries(log.details).map(([key, value]) => (
                                                        <div key={key} className="truncate max-w-xs">
                                                            <span className="text-foreground/50">{key}:</span> {String(value)}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
                                onClick={() => fetchLogs(pagination.page - 1)}
                            >
                                Précédent
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                disabled={pagination.page === pagination.pages}
                                onClick={() => fetchLogs(pagination.page + 1)}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}