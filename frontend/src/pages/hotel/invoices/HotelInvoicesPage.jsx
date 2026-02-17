import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Download, Calendar, Euro, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_LABELS = {
    issued: "Émise",
    paid: "Payée",
    overdue: "En retard",
    void: "Annulée"
};

const STATUS_COLORS = {
    issued: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    overdue: "bg-red-500/15 text-red-700 dark:text-red-400",
    void: "bg-foreground/10 text-foreground/70"
};

export default function HotelInvoicesPage() {
    const { getAuthHeader } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/invoices/hotel`, {
                headers: getAuthHeader()
            });
            setInvoices(res.data || []);
        } catch {
            toast.error("Erreur lors du chargement des factures");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleDownload = useCallback(async (invoiceId) => {
        setDownloadingId(invoiceId);
        try {
            const res = await axios.get(`${API}/invoices/${invoiceId}/download`, {
                headers: getAuthHeader()
            });

            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${res.data.pdf_base64}`;
            link.download = res.data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Facture téléchargée");
        } catch {
            toast.error("Erreur lors du téléchargement");
        } finally {
            setDownloadingId(null);
        }
    }, [getAuthHeader]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return "Date non définie";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    }, []);

    const formatAmount = useCallback((amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }, []);

    return (
        <div className="space-y-8" data-testid="hotel-invoices-page">
            <div>
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Mes factures
                        </h1>
                        <p className="text-foreground/70 mt-1">
                            Consultez et téléchargez vos factures
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                    <FileText className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        Aucune facture
                    </h3>
                    <p className="text-foreground/70">
                        Vos factures apparaîtront ici après vos premières missions
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="p-6 bg-card rounded-xl border border-border hover:border-brand/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge
                                            className={`${STATUS_COLORS[invoice.status]} border-0`}
                                        >
                                            {STATUS_LABELS[invoice.status]}
                                        </Badge>
                                        <span className="text-sm font-mono text-foreground/70">
                                            {invoice.invoice_number}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2 text-foreground/70">
                                            <Building2 className="w-4 h-4 text-brand" />
                                            <span>Hôtel {invoice.hotel_id?.slice(0, 8)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-foreground/70">
                                            <Calendar className="w-4 h-4 text-brand" />
                                            <span>{formatDate(invoice.issued_at || invoice.created_at)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-foreground/70">
                                            <FileText className="w-4 h-4 text-brand" />
                                            <span>{invoice.period_label || "Période non définie"}</span>
                                        </div>

                                        <div className="flex items-center gap-2 font-medium text-foreground">
                                            <Euro className="w-4 h-4 text-brand" />
                                            <span className="text-lg">{formatAmount(invoice.amount_total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    className="bg-brand hover:bg-brand-light text-primary-foreground shrink-0"
                                    onClick={() => handleDownload(invoice.id)}
                                    disabled={downloadingId === invoice.id}
                                >
                                    {downloadingId === invoice.id ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Télécharger
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}