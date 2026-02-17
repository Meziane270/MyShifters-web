// src/pages/admin/revenue/AdminRevenue.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import StatCard from "../components/StatCard";
import {
    RefreshCw,
    DollarSign,
    FileText,
    TrendingUp,
    Download
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminRevenue() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState(null);
    const [period, setPeriod] = useState("month");

    const fetchRevenue = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/revenue`, {
                headers: getAuthHeader(),
                params: { period }
            });
            setRevenueData(res.data);
        } catch (e) {
            toast.error("Impossible de charger les données de revenus");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, period]); // ← DÉPENDANCES
    useEffect(() => {
        fetchRevenue();
    }, [fetchRevenue]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Revenus
                    </h1>
                    <p className="text-foreground/70">
                        Suivi des commissions et factures
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-40 bg-background border-border">
                            <SelectValue placeholder="Période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Aujourd'hui</SelectItem>
                            <SelectItem value="week">Cette semaine</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                            <SelectItem value="year">Cette année</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={fetchRevenue}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Chiffre d'affaires total"
                            value={formatCurrency(revenueData?.total_revenue || 0)}
                            icon={DollarSign}
                        />
                        <StatCard
                            label="Factures émises"
                            value={revenueData?.total_invoices || 0}
                            icon={FileText}
                        />
                        <StatCard
                            label="Commission moyenne"
                            value="15%"
                            icon={TrendingUp}
                        />
                    </div>

                    {/* Period revenue */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="font-semibold text-foreground mb-4">
                            Revenus par {period === 'day' ? 'heure' : period === 'year' ? 'mois' : 'jour'}
                        </h2>
                        <div className="space-y-3">
                            {revenueData?.revenue_by_period?.map((item) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <span className="text-foreground/70">{item._id}</span>
                                    <div className="flex items-center gap-4">
                                            <span className="text-sm text-foreground/50">
                                                {item.count} facture{item.count > 1 ? 's' : ''}
                                            </span>
                                        <span className="font-semibold text-foreground">
                                                {formatCurrency(item.total)}
                                            </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly history */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="font-semibold text-foreground mb-4">
                            Historique mensuel
                        </h2>
                        <div className="space-y-3">
                            {revenueData?.monthly_revenue?.map((month) => {
                                const [year, monthNum] = month._id.split('-');
                                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                                return (
                                    <div key={month._id} className="flex items-center justify-between">
                                            <span className="text-foreground/70">
                                                {date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                            </span>
                                        <span className="font-semibold text-foreground">
                                                {formatCurrency(month.total)}
                                            </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Export button */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            className="border-border"
                            onClick={() => {/* TODO: Export PDF/Excel */}}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exporter les données
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}