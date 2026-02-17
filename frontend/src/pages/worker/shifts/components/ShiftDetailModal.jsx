// src/pages/worker/shifts/components/ShiftDetailModal.jsx
import { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import {
    Building2,
    MapPin,
    Calendar,
    Clock,
    Euro,
    Briefcase,
    Send,
    X,
    Info
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShiftDetailModal({ shift, application, isOpen, onClose, onSuccess }) {
    const { getAuthHeader } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const isApplication = !!application;

    const handleSubmit = useCallback(async () => {
        if (!shift?.id) return;
        setLoading(true);
        try {
            await axios.post(
                `${API}/applications`,
                {
                    shift_id: shift.id,
                    message: message.trim() || undefined,
                },
                { headers: getAuthHeader() }
            );
            onSuccess?.();
            onClose?.();
            setMessage("");
            toast.success("Candidature envoyée avec succès !");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la candidature");
        } finally {
            setLoading(false);
        }
    }, [shift, message, getAuthHeader, onSuccess, onClose]);

    if (!shift) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            weekday: 'long',
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getServiceLabel = (type) => {
        const labels = {
            reception: "Réception",
            housekeeping: "Housekeeping",
            maintenance: "Maintenance Technique",
            restaurant: "Restauration & Salle",
        };
        return labels[type] || type;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white border-slate-100 max-w-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                <div className="h-32 bg-brand flex items-center px-10">
                    <div className="space-y-1">
                        <DialogTitle className="text-white text-2xl font-black tracking-tight">
                            {shift.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                            <Building2 className="w-4 h-4" />
                            {shift.hotel_name}
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Date
                            </div>
                            <div className="font-bold text-slate-900">
                                {shift.dates?.length > 0 ? formatDate(shift.dates[0]) : formatDate(shift.date)}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Horaires
                            </div>
                            <div className="font-bold text-slate-900">
                                {shift.start_time} - {shift.end_time}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Briefcase className="w-3 h-3" /> Service
                            </div>
                            <div className="font-bold text-slate-900">
                                {getServiceLabel(shift.service_type)}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Euro className="w-3 h-3" /> Rémunération
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-900">{shift.hourly_rate}€</span>
                                <span className="text-xs text-slate-400">/heure</span>
                            </div>
                        </div>
                    </div>

                    {shift.hotel_city && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Localisation
                            </div>
                            <p className="font-bold text-slate-900">{shift.hotel_address || shift.hotel_city}</p>
                        </div>
                    )}

                    {shift.description && (
                        <div className="space-y-2">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3" /> Description
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {shift.description}
                            </p>
                        </div>
                    )}

                    {!isApplication && (
                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Message de motivation (optionnel)
                            </label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Parlez-nous de votre expérience..."
                                className="bg-slate-50 border-slate-100 rounded-2xl min-h-[100px] focus:ring-brand focus:border-brand"
                            />
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose} className="border-slate-200 rounded-xl px-8 py-6 font-bold">
                        Fermer
                    </Button>
                    {!isApplication && (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-brand hover:bg-brand-light text-white rounded-xl px-8 py-6 font-bold shadow-lg shadow-brand/20"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Envoyer ma candidature
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
