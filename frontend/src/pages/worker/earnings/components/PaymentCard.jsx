// src/pages/worker/earnings/components/PaymentCard.jsx
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import StatusBadge from "../../components/StatusBadge";
import { Calendar, Euro, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";

export default function PaymentCard({ payout, detailed = false }) {
    const [expanded, setExpanded] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 hover:border-brand/30 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                        <Euro className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                                {formatCurrency(payout.amount)}
                            </h4>
                            <StatusBadge status={payout.status} context="payment" />
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-foreground/70">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(payout.created_at)}</span>
                            </div>
                            {payout.period_label && (
                                <>
                                    <span className="text-foreground/30">•</span>
                                    <span>{payout.period_label}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {detailed && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground/50"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>

            {detailed && expanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {payout.invoice_number && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/70">N° facture</span>
                            <span className="text-foreground font-mono">{payout.invoice_number}</span>
                        </div>
                    )}
                    {payout.paid_at && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/70">Payé le</span>
                            <span className="text-foreground">{formatDate(payout.paid_at)}</span>
                        </div>
                    )}
                    {payout.method && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground/70">Mode de paiement</span>
                            <span className="text-foreground">{payout.method}</span>
                        </div>
                    )}
                    {payout.invoice_id && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border mt-2"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Télécharger la facture
                            <Download className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}