// src/pages/admin/disputes/AdminDisputes.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    RefreshCw,
    Search,
    AlertTriangle
} from "lucide-react";
import DisputeFilters from "./components/DisputeFilters";
import DisputeCard from "./components/DisputeCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDisputes() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [disputes, setDisputes] = useState([]);
    const [filters, setFilters] = useState({
        status: "",
        search: ""
    });

    const fetchDisputes = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;

            const res = await axios.get(`${API}/admin/disputes`, {
                headers: getAuthHeader(),
                params
            });
            setDisputes(res.data || []);
        } catch (e) {
            toast.error("Impossible de charger les litiges");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, filters.status]); // ← DÉPENDANCES
    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDisputes();
    };

    const openCount = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Litiges
                    </h1>
                    <p className="text-foreground/70">
                        {openCount} litige{openCount > 1 ? 's' : ''} ouvert{openCount > 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={fetchDisputes}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                        placeholder="Rechercher par n° litige, hôtel, worker..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9 bg-background border-border"
                    />
                </div>
                <Button type="submit" className="bg-brand hover:bg-brand-light text-primary-foreground">
                    Rechercher
                </Button>
            </form>

            {/* Filters */}
            <DisputeFilters
                filters={filters}
                onChange={setFilters}
            />

            {/* Disputes list */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : disputes.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <AlertTriangle className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                    <p className="text-foreground/70">Aucun litige trouvé</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {disputes.map((dispute) => (
                        <DisputeCard
                            key={dispute.id}
                            dispute={dispute}
                            onUpdate={fetchDisputes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}