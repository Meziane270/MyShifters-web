// src/pages/admin/disputes/components/DisputeCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import StatusPill from "../../components/StatusPill";
import ResolveDisputeModal from "./ResolveDisputeModal";
import {
    AlertTriangle,
    Building2,
    Briefcase,
    Calendar,
    MessageSquare,
    DollarSign,
    ChevronRight
} from "lucide-react";

export default function DisputeCard({ dispute, onUpdate }) {
    const navigate = useNavigate();
    const [resolveModalOpen, setResolveModalOpen] = useState(false);

    const getReasonLabel = (reason) => {
        const labels = {
            no_show: "Worker absent",
            late_cancel: "Annulation tardive",
            payment: "Non-paiement",
            quality: "Travail non conforme",
            behavior: "Comportement inapproprié",
            other: "Autre"
        };
        return labels[reason] || reason;
    };

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                dispute.status === 'open' || dispute.status === 'under_review'
                                    ? 'bg-orange-500/10'
                                    : 'bg-emerald-500/10'
                            }`}>
                                <AlertTriangle className={`w-5 h-5 ${
                                    dispute.status === 'open' || dispute.status === 'under_review'
                                        ? 'text-orange-600'
                                        : 'text-emerald-600'
                                }`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">
                                        Litige #{dispute.id.slice(-8)}
                                    </h3>
                                    <StatusPill status={dispute.status} />
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                    <div className="flex items-center gap-1 text-foreground/70">
                                        <Building2 className="w-4 h-4" />
                                        <span>{dispute.hotel?.hotel_name || dispute.hotel?.name}</span>
                                    </div>
                                    <span className="text-foreground/30">•</span>
                                    <div className="flex items-center gap-1 text-foreground/70">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{dispute.worker?.name}</span>
                                    </div>
                                    <span className="text-foreground/30">•</span>
                                    <div className="flex items-center gap-1 text-foreground/70">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {formatDistanceToNow(new Date(dispute.created_at), {
                                                addSuffix: true,
                                                locale: fr
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Badge variant="outline" className="border-border">
                                        {getReasonLabel(dispute.reason)}
                                    </Badge>
                                </div>
                                <p className="mt-3 text-sm text-foreground/70 line-clamp-2">
                                    {dispute.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {dispute.status === 'open' && (
                                <Button
                                    size="sm"
                                    className="bg-brand hover:bg-brand-light text-primary-foreground"
                                    onClick={() => setResolveModalOpen(true)}
                                >
                                    Traiter
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                onClick={() => navigate(`/admin/disputes/${dispute.id}`)}
                            >
                                Détails
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>

                    {dispute.refund_amount > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-foreground/50" />
                                <span className="text-foreground/70">Remboursement :</span>
                                <span className="font-semibold text-foreground">
                                    {dispute.refund_amount} €
                                </span>
                                {dispute.resolved_at && (
                                    <span className="text-xs text-foreground/50 ml-2">
                                        Résolu le {new Date(dispute.resolved_at).toLocaleDateString('fr-FR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ResolveDisputeModal
                isOpen={resolveModalOpen}
                onClose={() => setResolveModalOpen(false)}
                dispute={dispute}
                onSuccess={onUpdate}
            />
        </>
    );
}