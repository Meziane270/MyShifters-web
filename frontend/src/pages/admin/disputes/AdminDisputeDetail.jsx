// src/pages/admin/disputes/AdminDisputeDetail.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import StatusPill from "../components/StatusPill";
import ResolveDisputeModal from "./components/ResolveDisputeModal";
import {
    ArrowLeft,
    AlertTriangle,
    Building2,
    Briefcase,
    Calendar,
    Clock,
    MessageSquare,
    DollarSign,
    User,
    Mail,
    Phone,
    Send
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDisputeDetail() {
    const { disputeId } = useParams();
    const navigate = useNavigate();
    const { getAuthHeader } = useAuth();

    const [loading, setLoading] = useState(true);
    const [dispute, setDispute] = useState(null);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    const fetchDispute = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/disputes/${disputeId}`, {
                headers: getAuthHeader()
            });
            setDispute(res.data);
        } catch (e) {
            toast.error("Impossible de charger le litige");
            navigate("/admin/disputes");
        } finally {
            setLoading(false);
        }
    }, [disputeId, getAuthHeader, navigate]); // ← DÉPENDANCES
    useEffect(() => {
        fetchDispute();
    }, [fetchDispute]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            await axios.post(
                `${API}/admin/disputes/${disputeId}/messages`,
                { body: newMessage.trim() },
                { headers: getAuthHeader() }
            );
            setNewMessage("");
            fetchDispute();
        } catch (e) {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    if (loading || !dispute) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={() => navigate("/admin/disputes")}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Litige #{dispute.id.slice(-8)}
                        </h1>
                        <p className="text-foreground/70">
                            Ouvert le {new Date(dispute.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        </p>
                    </div>
                </div>
                {dispute.status === 'open' && (
                    <Button
                        className="bg-brand hover:bg-brand-light text-primary-foreground"
                        onClick={() => setResolveModalOpen(true)}
                    >
                        Traiter le litige
                    </Button>
                )}
            </div>

            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            dispute.status === 'open' || dispute.status === 'under_review'
                                ? 'bg-orange-500/10'
                                : 'bg-emerald-500/10'
                        }`}>
                            <AlertTriangle className={`w-6 h-6 ${
                                dispute.status === 'open' || dispute.status === 'under_review'
                                    ? 'text-orange-600'
                                    : 'text-emerald-600'
                            }`} />
                        </div>
                        <div>
                            <div className="text-sm text-foreground/60">Statut</div>
                            <StatusPill status={dispute.status} />
                        </div>
                    </div>
                    <Badge variant="outline" className="border-border">
                        {getReasonLabel(dispute.reason)}
                    </Badge>
                </div>
            </div>

            {/* Parties */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Hotel */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 className="w-5 h-5 text-foreground/70" />
                        <h2 className="font-semibold text-foreground">Hôtel</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-foreground/50" />
                            <span className="text-foreground">
                                {dispute.hotel?.hotel_name || dispute.hotel?.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-foreground/50" />
                            <span className="text-foreground/70">{dispute.hotel?.email}</span>
                        </div>
                        {dispute.hotel?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-foreground/50" />
                                <span className="text-foreground/70">{dispute.hotel?.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Worker */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Briefcase className="w-5 h-5 text-foreground/70" />
                        <h2 className="font-semibold text-foreground">Worker</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-foreground/50" />
                            <span className="text-foreground">{dispute.worker?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-foreground/50" />
                            <span className="text-foreground/70">{dispute.worker?.email}</span>
                        </div>
                        {dispute.worker?.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-foreground/50" />
                                <span className="text-foreground/70">{dispute.worker?.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shift details */}
            {dispute.shift && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-5 h-5 text-foreground/70" />
                        <h2 className="font-semibold text-foreground">Shift concerné</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-foreground/60">Titre</div>
                            <div className="text-foreground font-medium">{dispute.shift.title}</div>
                        </div>
                        <div>
                            <div className="text-xs text-foreground/60">Date</div>
                            <div className="text-foreground">{dispute.shift.date}</div>
                        </div>
                        <div>
                            <div className="text-xs text-foreground/60">Horaire</div>
                            <div className="text-foreground">
                                {dispute.shift.start_time} - {dispute.shift.end_time}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-foreground/60">Service</div>
                            <div className="text-foreground capitalize">{dispute.shift.service_type}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-foreground/70" />
                    <h2 className="font-semibold text-foreground">Description du litige</h2>
                </div>
                <p className="text-foreground/70 whitespace-pre-wrap">
                    {dispute.description}
                </p>
                <div className="mt-4 text-xs text-foreground/50">
                    Ouvert par {dispute.opened_by === 'hotel' ? 'l\'hôtel' : 'le worker'}
                </div>
            </div>

            {/* Messages */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-foreground/70" />
                        <h2 className="font-semibold text-foreground">Conversation</h2>
                    </div>
                </div>

                <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                    {dispute.messages?.length === 0 ? (
                        <p className="text-center text-foreground/70 py-8">
                            Aucun message pour le moment
                        </p>
                    ) : (
                        dispute.messages?.map((msg) => {
                            const isAdmin = msg.sender_role === 'admin';
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        isAdmin
                                            ? 'bg-brand/10 border border-brand/20'
                                            : 'bg-background border border-border'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-foreground/70">
                                                {msg.sender_role === 'admin' ? 'Admin' :
                                                    msg.sender_role === 'hotel' ? 'Hôtel' : 'Worker'}
                                            </span>
                                            <span className="text-xs text-foreground/50">
                                                {new Date(msg.created_at).toLocaleString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">
                                            {msg.body}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {dispute.status !== 'rejected' && dispute.status !== 'resolved_hotel' && dispute.status !== 'resolved_worker' && (
                    <div className="p-6 border-t border-border">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Écrire un message..."
                                className="flex-1 min-h-[80px] rounded-xl bg-background border border-border p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand/50"
                            />
                            <Button
                                className="bg-brand hover:bg-brand-light text-primary-foreground"
                                onClick={sendMessage}
                                disabled={sending || !newMessage.trim()}
                            >
                                {sending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Resolution info */}
            {dispute.resolved_at && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <h2 className="font-semibold text-foreground">Résolution</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground/70">Décision :</span>
                            <StatusPill status={dispute.status} />
                        </div>
                        {dispute.refund_amount > 0 && (
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-foreground/50" />
                                <span className="text-foreground">
                                    Remboursement de {dispute.refund_amount} €
                                </span>
                            </div>
                        )}
                        <div className="mt-2 p-3 bg-foreground/5 rounded-lg">
                            <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                {dispute.resolution_note}
                            </p>
                        </div>
                        <div className="text-xs text-foreground/50">
                            Résolu le {new Date(dispute.resolved_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        </div>
                    </div>
                </div>
            )}

            <ResolveDisputeModal
                isOpen={resolveModalOpen}
                onClose={() => setResolveModalOpen(false)}
                dispute={dispute}
                onSuccess={fetchDispute}
            />
        </div>
    );
}