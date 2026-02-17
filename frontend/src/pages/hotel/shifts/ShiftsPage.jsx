import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { PlusCircle, CalendarDays } from "lucide-react";
import { Button } from "../../../components/ui/button";

import StatusBanner from "../components/StatusBanner";
import ShiftCard from "./components/ShiftCard";
import ShiftFilters from "./components/ShiftFilters";
import CreateShiftDialog from "./CreateShiftDialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const canActFromStatus = (status) => status === "verified" || status === "active";

export default function ShiftsPage() {
    const { getAuthHeader, user } = useAuth();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [serviceFilter, setServiceFilter] = useState("all");

    const status = useMemo(() => {
        const v = user?.verification_status;
        const banned = user?.is_banned || user?.banned;
        const disabled = user?.is_disabled || user?.disabled;
        if (banned) return "banned";
        if (disabled) return "disabled";
        if (v === "verified") return "verified";
        return "pending";
    }, [user]);

    const canAct = useMemo(() => canActFromStatus(status), [status]);
    const isBlocked = useMemo(() => status === "banned" || status === "disabled", [status]);

    const fetchShifts = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/shifts/hotel`, {
                headers: getAuthHeader()
            });
            setShifts(response.data);
        } catch {
            toast.error("Erreur lors du chargement des missions");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    const handleDeleteShift = useCallback(async (shiftId) => {
        if (isBlocked) {
            toast.error("Votre compte est bloqué. Contactez le support.");
            return;
        }
        if (!canAct) {
            toast.error("Votre établissement doit être validé avant de modifier des missions.");
            return;
        }

        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) return;

        try {
            await axios.delete(`${API}/shifts/${shiftId}`, {
                headers: getAuthHeader()
            });
            toast.success("Mission supprimée");
            fetchShifts();
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    }, [getAuthHeader, fetchShifts, canAct, isBlocked]);

    const filteredShifts = useMemo(() => {
        return shifts.filter((s) => {
            const okStatus = statusFilter === "all" ? true : s.status === statusFilter;
            const okService = serviceFilter === "all" ? true : s.service_type === serviceFilter;
            return okStatus && okService;
        });
    }, [shifts, statusFilter, serviceFilter]);

    const stats = useMemo(() => ({
        total: shifts.length,
        open: shifts.filter(s => s.status === "open").length,
        filled: shifts.filter(s => s.status === "filled").length,
        completed: shifts.filter(s => s.status === "completed").length,
        cancelled: shifts.filter(s => s.status === "cancelled").length,
    }), [shifts]);

    return (
        <div className="space-y-8" data-testid="shifts-page">
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                            Mes missions
                        </h1>
                        <p className="text-foreground/70">
                            Gérez vos offres de missions
                        </p>
                    </div>

                    <Button
                        className="bg-brand hover:bg-brand-light text-primary-foreground font-medium"
                        disabled={!canAct || isBlocked}
                        onClick={() => setIsCreateOpen(true)}
                        data-testid="create-shift-btn"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Nouvelle mission
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-foreground/70">
                        {filteredShifts.length} mission{filteredShifts.length > 1 ? "s" : ""}
                    </div>

                    <ShiftFilters
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        serviceFilter={serviceFilter}
                        onServiceChange={setServiceFilter}
                    />
                </div>

                <StatusBanner user={user} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredShifts.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                    <CalendarDays className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        Aucune mission
                    </h3>
                    <p className="text-foreground/70 mb-6">
                        Créez votre première mission pour trouver des extras
                    </p>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand hover:bg-brand-light text-primary-foreground"
                        disabled={!canAct || isBlocked}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Créer une mission
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredShifts.map((shift) => (
                        <ShiftCard
                            key={shift.id}
                            shift={shift}
                            onDelete={handleDeleteShift}
                            canAct={canAct}
                            isBlocked={isBlocked}
                        />
                    ))}
                </div>
            )}

            <CreateShiftDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchShifts}
                canAct={canAct}
                isBlocked={isBlocked}
            />
        </div>
    );
}