// src/pages/worker/shifts/components/ShiftCard.jsx
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import StatusBadge from "../../components/StatusBadge";
import ShiftDetailModal from "./ShiftDetailModal";
import {
    Building2,
    MapPin,
    Calendar,
    Clock,
    Euro,
    XCircle,
    CheckCircle,
    MessageSquare,
    ChevronRight
} from "lucide-react";

export default function ShiftCard({ application, type, onCancel, onComplete }) {
    const [modalOpen, setModalOpen] = useState(false);
    const shift = application.shift || {};

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const getServiceLabel = (service) => {
        const labels = {
            reception: "Réception",
            housekeeping: "Housekeeping",
            maintenance: "Maintenance Technique",
            restaurant: "Restauration & Salle"
        };
        return labels[service] || service;
    };

    return (
        <>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-brand/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-6">
                        {/* En-tête */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display group-hover:text-brand transition-colors">
                                    {shift.title || "Mission"}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-600">
                                        {shift.hotel_name || "Hôtel"}
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={application.status} context="application" />
                        </div>

                        {/* Détails demandés : Lieu, Dates, Horaires en dessous */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand shadow-sm">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieu</p>
                                    <p className="font-bold text-slate-900 text-sm">{shift.hotel_city || "Paris"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand shadow-sm">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                    <p className="font-bold text-slate-900 text-sm">
                                        {shift.dates?.length > 0
                                            ? formatDate(shift.dates[0])
                                            : formatDate(shift.date)}
                                        {shift.dates?.length > 1 && (
                                            <span className="ml-1 text-brand">+{shift.dates.length - 1} j</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-brand shadow-sm">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horaires</p>
                                    <p className="font-bold text-slate-900 text-sm">{shift.start_time} - {shift.end_time}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">
                                <Euro className="w-4 h-4" />
                                {shift.hourly_rate}€/h
                            </div>
                            <Badge variant="outline" className="px-4 py-2 border-slate-100 text-slate-500 font-bold rounded-xl bg-white">
                                {getServiceLabel(shift.service_type)}
                            </Badge>
                        </div>

                        {/* Message du worker */}
                        {application.message && (
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="w-4 h-4 text-brand mt-0.5" />
                                    <p className="text-sm text-slate-600 italic font-medium">
                                        "{application.message}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center lg:items-stretch gap-3">
                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-brand hover:bg-brand/90 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
                        >
                            Détails
                            <ChevronRight className="w-5 h-5" />
                        </Button>

                        {type === "application" && application.status === "pending" && (
                            <Button
                                variant="outline"
                                className="h-14 px-8 rounded-2xl border-red-100 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                                onClick={onCancel}
                            >
                                <XCircle className="w-5 h-5 mr-2" />
                                Annuler
                            </Button>
                        )}

                        {type === "mission" && application.status === "accepted" && (
                            <Button
                                className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition-all"
                                onClick={onComplete}
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Terminer
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ShiftDetailModal
                shift={shift}
                application={application}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
