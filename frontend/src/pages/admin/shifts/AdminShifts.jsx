// src/pages/admin/shifts/AdminShifts.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../../../components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "../../../components/ui/dialog";
import {
    RefreshCw, Search, Filter, ChevronDown, ChevronUp,
    Building2, Euro, Users, Calendar, UserCheck, X
} from "lucide-react";
import StatusPill from "../components/StatusPill";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_LABELS = {
    open: "Ouverte",
    filled: "Pourvue",
    completed: "Terminée",
    cancelled: "Annulée"
};

const STATUS_COLORS = {
    open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    filled: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    completed: "bg-foreground/10 text-foreground/70",
    cancelled: "bg-red-500/15 text-red-700 dark:text-red-400"
};

export default function AdminShifts() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
    const [filters, setFilters] = useState({ status: "", search: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [expandedShift, setExpandedShift] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");
    const [assigning, setAssigning] = useState(false);

    const fetchShifts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: pagination.limit };
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            const res = await axios.get(`${API}/admin/shifts`, {
                headers: getAuthHeader(), params
            });
            setShifts(res.data.shifts || []);
            setPagination({ total: res.data.total, page: res.data.page, limit: res.data.limit, pages: res.data.pages });
        } catch (e) {
            toast.error("Impossible de charger les missions");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, pagination.limit, filters]);

    const fetchWorkers = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/admin/users`, {
                headers: getAuthHeader(), params: { role: "worker", limit: 100 }
            });
            setWorkers(res.data.users || []);
        } catch {}
    }, [getAuthHeader]);

    useEffect(() => { fetchShifts(); }, [fetchShifts]);

    const handleAssign = async () => {
        if (!selectedWorker || !assignModal) return;
        setAssigning(true);
        try {
            await axios.put(`${API}/admin/shifts/${assignModal.id}/assign`,
                { worker_id: selectedWorker },
                { headers: getAuthHeader() }
            );
            toast.success("Worker assigné avec succès");
            setAssignModal(null);
            setSelectedWorker("");
            fetchShifts(pagination.page);
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de l'assignation");
        } finally {
            setAssigning(false);
        }
    };

    const openAssignModal = (shift) => {
        setAssignModal(shift);
        fetchWorkers();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR');
        } catch { return dateStr; }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Missions</h1>
                    <p className="text-foreground/70">{pagination.total} mission{pagination.total > 1 ? 's' : ''} au total</p>
                </div>
                <Button variant="outline" className="border-border" onClick={() => fetchShifts(pagination.page)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                        type="text"
                        placeholder="Rechercher par titre, hôtel..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9 bg-background border-border"
                        onKeyDown={(e) => e.key === 'Enter' && fetchShifts(1)}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className={`border-border ${showFilters ? 'bg-brand/10 text-brand' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="w-4 h-4 mr-2" /> Filtres
                </Button>
                <Button onClick={() => fetchShifts(1)} className="bg-brand hover:bg-brand-light text-primary-foreground">
                    Rechercher
                </Button>
            </div>

            {showFilters && (
                <div className="p-4 bg-card rounded-xl border border-border">
                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
                        <SelectTrigger className="w-48 bg-background border-border">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="open">Ouverte</SelectItem>
                            <SelectItem value="filled">Pourvue</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border">
                            <TableHead>Mission</TableHead>
                            <TableHead>Hôtel</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead>Taux horaire</TableHead>
                            <TableHead>Candidatures</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : shifts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-foreground/50">
                                    Aucune mission trouvée
                                </TableCell>
                            </TableRow>
                        ) : (
                            shifts.map((shift) => (
                                <>
                                    <TableRow key={shift.id} className="border-border">
                                        <TableCell>
                                            <div className="font-medium text-foreground">{shift.title}</div>
                                            <div className="text-xs text-foreground/50">{shift.service_type}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-foreground/40" />
                                                <span className="text-sm">{shift.hotel_name}</span>
                                            </div>
                                            {shift.hotel_city && <div className="text-xs text-foreground/50">{shift.hotel_city}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {shift.dates?.slice(0, 2).map(d => formatDate(d)).join(', ')}
                                                {shift.dates?.length > 2 && ` +${shift.dates.length - 2}`}
                                            </div>
                                            <div className="text-xs text-foreground/50">{shift.start_time} - {shift.end_time}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Euro className="w-3 h-3 text-foreground/50" />
                                                <span className="font-medium">{shift.hourly_rate} €/h</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3 text-foreground/50" />
                                                <span>{shift.applications?.length ?? 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[shift.status] || "bg-foreground/10"}>
                                                {STATUS_LABELS[shift.status] || shift.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-border"
                                                    onClick={() => setExpandedShift(expandedShift === shift.id ? null : shift.id)}
                                                >
                                                    {expandedShift === shift.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </Button>
                                                {shift.status === "open" && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-brand hover:bg-brand-light text-primary-foreground"
                                                        onClick={() => openAssignModal(shift)}
                                                    >
                                                        <UserCheck className="w-4 h-4 mr-1" /> Assigner
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedShift === shift.id && (
                                        <TableRow key={`${shift.id}-expanded`} className="border-border bg-muted/30">
                                            <TableCell colSpan={7} className="py-4">
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-sm text-foreground">Candidatures ({shift.applications?.length ?? 0})</h4>
                                                    {shift.applications?.length === 0 ? (
                                                        <p className="text-sm text-foreground/50">Aucune candidature</p>
                                                    ) : (
                                                        <div className="grid gap-2">
                                                            {shift.applications?.map(app => (
                                                                <div key={app.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                                                                    <div>
                                                                        <span className="font-medium text-sm">{app.worker_name || app.worker_email || app.worker_id}</span>
                                                                        <span className="text-xs text-foreground/50 ml-2">{app.worker_email}</span>
                                                                    </div>
                                                                    <Badge className={
                                                                        app.status === "accepted" ? "bg-emerald-500/15 text-emerald-700" :
                                                                        app.status === "rejected" ? "bg-red-500/15 text-red-700" :
                                                                        "bg-amber-500/15 text-amber-700"
                                                                    }>
                                                                        {app.status === "accepted" ? "Accepté" : app.status === "rejected" ? "Refusé" : "En attente"}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {shift.description && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1">Description</p>
                                                            <p className="text-sm text-foreground/70">{shift.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
                        )}
                    </TableBody>
                </Table>
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                        <div className="text-sm text-foreground/70">Page {pagination.page} sur {pagination.pages}</div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-border" disabled={pagination.page === 1} onClick={() => fetchShifts(pagination.page - 1)}>Précédent</Button>
                            <Button size="sm" variant="outline" className="border-border" disabled={pagination.page === pagination.pages} onClick={() => fetchShifts(pagination.page + 1)}>Suivant</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Assign Modal */}
            <Dialog open={!!assignModal} onOpenChange={() => { setAssignModal(null); setSelectedWorker(""); }}>
                <DialogContent className="bg-card border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assigner manuellement un worker</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-foreground/70 mb-1">Mission : <span className="font-semibold text-foreground">{assignModal?.title}</span></p>
                            <p className="text-sm text-foreground/70">Hôtel : <span className="font-semibold text-foreground">{assignModal?.hotel_name}</span></p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sélectionner un worker</label>
                            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Choisir un worker..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map(w => (
                                        <SelectItem key={w.id} value={w.id}>
                                            {w.first_name} {w.last_name} — {w.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" className="border-border" onClick={() => { setAssignModal(null); setSelectedWorker(""); }}>
                                Annuler
                            </Button>
                            <Button
                                className="bg-brand hover:bg-brand-light text-primary-foreground"
                                onClick={handleAssign}
                                disabled={!selectedWorker || assigning}
                            >
                                {assigning ? "Assignation..." : "Confirmer"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
