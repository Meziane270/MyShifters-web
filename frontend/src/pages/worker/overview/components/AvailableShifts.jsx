import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
    Briefcase,
    Clock,
    Euro,
    Building2,
    MapPin,
    Calendar,
    ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import ShiftDetailModal from "../../shifts/components/ShiftDetailModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AvailableShifts({ limit = 5 }) {
    const { getAuthHeader, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState([]);
    const [selectedService, setSelectedService] = useState("all");
    const [selectedShift, setSelectedShift] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(limit);

    // ✅ FIX: useMemo pour stabiliser workerSkills
    const workerSkills = useMemo(() =>
            Array.isArray(user?.skills) ? user.skills : [],
        [user?.skills]
    );

    const formatDate = (dateString) => {
        if (!dateString) return "Date non définie";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            return new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch {
            return dateString;
        }
    };

    const fetchAvailableShifts = useCallback(async () => {
        if (workerSkills.length === 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const params = {
                status: "open"
            };

            if (selectedService !== "all" && workerSkills.includes(selectedService)) {
                params.service_type = selectedService;
            }

            const res = await axios.get(`${API}/shifts`, {
                headers: getAuthHeader(),
                params
            });

            let filteredShifts = res.data || [];

            if (selectedService === "all") {
                filteredShifts = filteredShifts.filter(shift =>
                    workerSkills.includes(shift.service_type)
                );
            }

            setShifts(filteredShifts);
        } catch (e) {
            console.error("Erreur chargement shifts:", e);
            toast.error("Impossible de charger les shifts disponibles");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader, selectedService, workerSkills]); // ✅ Plus d'erreur ESLint !

    useEffect(() => {
        fetchAvailableShifts();
    }, [fetchAvailableShifts]);

    const handleApplyClick = (shift) => {
        setSelectedShift(shift);
        setModalOpen(true);
    };

    if (workerSkills.length === 0) {
        return (
            <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/70">
                    Vous n'avez pas encore défini vos compétences.
                </p>
                <Button asChild variant="outline" className="mt-4 border-border">
                    <a href="/worker/profile">Compléter mon profil</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filtre */}
            <div className="flex items-center gap-2 pb-2">
                <Briefcase className="w-4 h-4 text-foreground/50" />
                <span className="text-sm text-foreground/70">Filtrer par :</span>
                <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-48 bg-background border-border">
                        <SelectValue placeholder="Tous les métiers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les métiers</SelectItem>
                        {workerSkills.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                                {skill === 'reception' && 'Réception'}
                                {skill === 'housekeeping' && 'Housekeeping'}
                                {skill === 'maintenance' && 'Maintenance'}
                                {skill === 'restaurant' && 'Restauration'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Liste des shifts */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
            ) : shifts.slice(0, displayLimit).length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-foreground/70">
                        Aucun shift disponible pour le moment
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {shifts.slice(0, displayLimit).map((shift) => (
                        <div
                            key={shift.id}
                            className="p-4 bg-background rounded-lg border border-border hover:border-brand/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-foreground truncate">
                                            {shift.title}
                                        </h4>
                                        <Badge variant="outline" className="border-border shrink-0">
                                            {shift.service_type === 'reception' && 'Réception'}
                                            {shift.service_type === 'housekeeping' && 'Housekeeping'}
                                            {shift.service_type === 'maintenance' && 'Maintenance'}
                                            {shift.service_type === 'restaurant' && 'Restauration'}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                                        <div className="flex items-center gap-1 text-foreground/70">
                                            <Building2 className="w-4 h-4" />
                                            <span>{shift.hotel_name}</span>
                                        </div>
                                        {shift.hotel_city && (
                                            <div className="flex items-center gap-1 text-foreground/70">
                                                <MapPin className="w-4 h-4" />
                                                <span>{shift.hotel_city}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-foreground/70">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(shift.dates?.[0] || shift.date)}</span>
                                            {shift.dates?.length > 1 && (
                                                <span className="text-xs">+{shift.dates.length - 1}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-foreground/70">
                                            <Clock className="w-4 h-4" />
                                            <span>{shift.start_time} - {shift.end_time}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-medium text-foreground">
                                            <Euro className="w-4 h-4" />
                                            <span>{shift.hourly_rate}€/h</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    className="bg-brand hover:bg-brand-light text-primary-foreground shrink-0"
                                    onClick={() => handleApplyClick(shift)}
                                >
                                    Postuler
                                </Button>
                            </div>
                        </div>
                    ))}

                    {shifts.length > displayLimit && (
                        <Button
                            variant="outline"
                            className="w-full mt-2 border-border"
                            onClick={() => setDisplayLimit(prev => prev + 5)}
                        >
                            Voir plus de missions ({shifts.length - displayLimit})
                        </Button>
                    )}
                </div>
            )}

            <ShiftDetailModal
                shift={selectedShift}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    fetchAvailableShifts();
                    toast.success("Candidature envoyée !");
                }}
            />
        </div>
    );
}