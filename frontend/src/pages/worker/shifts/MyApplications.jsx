// src/pages/worker/shifts/MyApplications.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Search,
    RefreshCw,
    XCircle
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ShiftCard from "./components/ShiftCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyApplications() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/applications/worker`, {
                headers: getAuthHeader()
            });
            setApplications(res.data || []);
            setFiltered(res.data || []);
        } catch (e) {
            toast.error("Impossible de charger vos candidatures");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(applications);
        } else {
            const lower = search.toLowerCase();
            setFiltered(applications.filter(app =>
                app.shift_title?.toLowerCase().includes(lower) ||
                app.worker_name?.toLowerCase().includes(lower)
            ));
        }
    }, [search, applications]);

    const handleCancel = useCallback(async (applicationId) => {
        try {
            await axios.delete(`${API}/applications/${applicationId}`, {
                headers: getAuthHeader()
            });
            toast.success("Candidature annulée");
            fetchApplications();
        } catch (e) {
            toast.error("Erreur lors de l'annulation");
        }
    }, [getAuthHeader, fetchApplications]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Mes candidatures
                    </h1>
                    <p className="text-foreground/70">
                        {filtered.length} candidature{filtered.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={fetchApplications}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                <Input
                    placeholder="Rechercher par titre ou hôtel..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-background border-border"
                />
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <p className="text-foreground/70">
                        {applications.length === 0
                            ? "Vous n'avez pas encore postulé à un shift."
                            : "Aucune candidature ne correspond à votre recherche."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app) => (
                        <ShiftCard
                            key={app.id}
                            application={app}
                            type="application"
                            onCancel={() => handleCancel(app.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}