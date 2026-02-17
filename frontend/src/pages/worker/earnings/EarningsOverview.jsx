// src/pages/worker/earnings/EarningsOverview.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { RefreshCw, DollarSign, Calendar, TrendingUp, Clock } from "lucide-react";
import EarningsChart from "./components/EarningsChart";
import PaymentCard from "./components/PaymentCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EarningsOverview() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        pending: 0,
        paid: 0,
        monthlyData: []
    });
    const [payouts, setPayouts] = useState([]);

    const fetchEarnings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/worker/earnings`, {
                headers: getAuthHeader()
            });
            setEarnings(res.data);
        } catch (e) {
            toast.error("Impossible de charger vos gains");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    const fetchPayouts = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/worker/payouts`, {
                headers: getAuthHeader()
            });
            setPayouts(res.data || []);
        } catch (e) {
            // Non bloquant
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchEarnings();
        fetchPayouts();
    }, [fetchEarnings, fetchPayouts]);

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
                        Mes gains
                    </h1>
                    <p className="text-foreground/70">
                        Suivez vos revenus et paiements
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={() => {
                        fetchEarnings();
                        fetchPayouts();
                    }}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-foreground/70">Gains totaux</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(earnings.total)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-brand/10 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-brand" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-foreground/70">Ce mois</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(earnings.thisMonth)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-foreground/70">En attente</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(earnings.pending)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-foreground/70">Déjà payé</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(earnings.paid)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphique d'évolution */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Évolution des gains</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EarningsChart data={earnings.monthlyData} />
                        </CardContent>
                    </Card>

                    {/* Historique des paiements */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-foreground">
                                Derniers paiements
                            </CardTitle>
                            <Button asChild variant="link" className="text-brand">
                                <a href="/worker/payments">Voir tout</a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {payouts.length === 0 ? (
                                <p className="text-center text-foreground/70 py-6">
                                    Aucun paiement pour le moment
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {payouts.slice(0, 5).map((payout) => (
                                        <PaymentCard key={payout.id} payout={payout} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}