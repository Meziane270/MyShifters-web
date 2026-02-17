// src/pages/worker/earnings/PaymentHistory.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { RefreshCw, Search, Download, Filter } from "lucide-react";
import PaymentCard from "./components/PaymentCard";
import StatusBadge from "../components/StatusBadge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentHistory() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/worker/payouts`, {
                headers: getAuthHeader()
            });
            setPayouts(res.data || []);
            setFiltered(res.data || []);
        } catch (e) {
            toast.error("Impossible de charger l'historique des paiements");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    useEffect(() => {
        let filteredList = payouts;

        // Filtre par recherche (période)
        if (search.trim()) {
            const lower = search.toLowerCase();
            filteredList = filteredList.filter(p =>
                p.period_label?.toLowerCase().includes(lower) ||
                p.invoice_number?.toLowerCase().includes(lower)
            );
        }

        // Filtre par statut
        if (statusFilter !== "all") {
            filteredList = filteredList.filter(p => p.status === statusFilter);
        }

        setFiltered(filteredList);
    }, [search, statusFilter, payouts]);

    const handleExport = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/worker/payouts/export`, {
                headers: getAuthHeader(),
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `paiements-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error("Erreur lors de l'export");
        }
    }, [getAuthHeader]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Historique des paiements
                    </h1>
                    <p className="text-foreground/70">
                        {filtered.length} paiement{filtered.length > 1 ? 's' : ''}
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
                        onClick={fetchPayouts}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <Input
                        placeholder="Rechercher par période ou n° facture..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-background border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-foreground/50" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-background border border-border text-foreground text-sm"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="paid">Payé</option>
                        <option value="failed">Échoué</option>
                    </select>
                </div>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <p className="text-foreground/70">
                        {payouts.length === 0
                            ? "Aucun paiement pour le moment."
                            : "Aucun paiement ne correspond à votre recherche."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((payout) => (
                        <PaymentCard key={payout.id} payout={payout} detailed />
                    ))}
                </div>
            )}
        </div>
    );
}