import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, X, Clock } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { Badge } from "../../../components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CreateShiftDialog({ isOpen, onClose, onSuccess, canAct, isBlocked }) {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        service_type: "",
        dates: [],
        start_time: "08:00",
        end_time: "16:00",
        hourly_rate: "",
        positions_available: 1,
    });

    // Générer les créneaux de 30min
    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = 0; h < 24; h++) {
            const hour = h.toString().padStart(2, '0');
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    }, []);

    const safeFormat = (date, formatStr) => {
        if (!date || !isValid(date)) return "";
        try {
            return format(date, formatStr, { locale: fr });
        } catch (e) {
            return "";
        }
    };

    const handleDateSelect = useCallback((dates) => {
        // dates est un tableau en mode multiple
        const newDates = Array.isArray(dates) ? dates : (dates ? [dates] : []);
        setSelectedDates(newDates);
        setFormData(prevForm => ({
            ...prevForm,
            dates: newDates.map(d => safeFormat(d, "yyyy-MM-dd")).filter(Boolean)
        }));
    }, []);

    const removeDate = useCallback((dateToRemove) => {
        setSelectedDates(prev => {
            const newDates = prev.filter(d => 
                safeFormat(d, "yyyy-MM-dd") !== safeFormat(dateToRemove, "yyyy-MM-dd")
            );
            setFormData(prevForm => ({
                ...prevForm,
                dates: newDates.map(d => safeFormat(d, "yyyy-MM-dd")).filter(Boolean)
            }));
            return newDates;
        });
    }, []);

    const validateForm = useCallback(() => {
        const rate = Number(formData.hourly_rate);
        const positions = Number(formData.positions_available);

        if (!formData.title || !formData.service_type || !formData.description) {
            toast.error("Veuillez remplir tous les champs.");
            return false;
        }
        if (!formData.dates || formData.dates.length === 0) {
            toast.error("Veuillez sélectionner au moins une date.");
            return false;
        }
        if (!formData.start_time || !formData.end_time) {
            toast.error("Veuillez saisir les horaires.");
            return false;
        }
        if (!Number.isFinite(rate) || rate <= 0) {
            toast.error("Le taux horaire doit être supérieur à 0.");
            return false;
        }
        if (!Number.isFinite(positions) || positions < 1) {
            toast.error("Le nombre de postes doit être au moins 1.");
            return false;
        }
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (isBlocked) {
            toast.error("Votre compte est bloqué. Contactez le support.");
            return;
        }
        if (!canAct) {
            toast.error("Votre établissement doit être validé avant de créer des missions.");
            return;
        }
        if (!validateForm()) return;

        setLoading(true);
        try {
            await axios.post(
                `${API}/shifts`,
                {
                    ...formData,
                    hourly_rate: parseFloat(formData.hourly_rate),
                    positions_available: parseInt(formData.positions_available, 10),
                },
                { headers: getAuthHeader() }
            );

            toast.success("Mission créée avec succès !");
            onClose();
            setFormData({
                title: "",
                description: "",
                service_type: "",
                dates: [],
                start_time: "08:00",
                end_time: "16:00",
                hourly_rate: "",
                positions_available: 1,
            });
            setSelectedDates([]);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    }, [formData, getAuthHeader, onSuccess, onClose, validateForm, canAct, isBlocked]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                        Créer une mission
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label className="text-foreground">Titre de la mission</Label>
                        <Input
                            placeholder="Ex: Réceptionniste de nuit"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            required
                            className="bg-background border-border text-foreground"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Type de service</Label>
                        <Select
                            value={formData.service_type}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, service_type: value }))}
                        >
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder="Sélectionnez un service" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="reception">Réception</SelectItem>
                                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                <SelectItem value="maintenance">Maintenance Technique</SelectItem>
                                <SelectItem value="restaurant">Restauration & Salle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Description</Label>
                        <Textarea
                            placeholder="Décrivez la mission..."
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            required
                            className="bg-background border-border text-foreground min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Dates</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start bg-background border-border text-foreground hover:bg-background"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDates.length > 0
                                        ? `${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} sélectionnée${selectedDates.length > 1 ? 's' : ''}`
                                        : "Sélectionner des dates"
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                                <Calendar
                                    mode="multiple"
                                    selected={selectedDates}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date().setHours(0,0,0,0)}
                                    initialFocus
                                    className="bg-card"
                                />
                            </PopoverContent>
                        </Popover>

                        {selectedDates.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedDates.map((date, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-brand/10 text-brand border-brand/20 flex items-center gap-1"
                                    >
                                        {safeFormat(date, "dd/MM/yyyy")}
                                        <X 
                                            className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                            onClick={() => removeDate(date)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Heure de début</Label>
                            <Select
                                value={formData.start_time}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, start_time: v }))}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {timeSlots.map(slot => (
                                        <SelectItem key={`start-${slot}`} value={slot}>{slot}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Heure de fin</Label>
                            <Select
                                value={formData.end_time}
                                onValueChange={(v) => setFormData(prev => ({ ...prev, end_time: v }))}
                            >
                                <SelectTrigger className="bg-background border-border">
                                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {timeSlots.map(slot => (
                                        <SelectItem key={`end-${slot}`} value={slot}>{slot}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-foreground">Taux horaire Worker (€)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Ex: 17.5"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, hourly_rate: e.target.value }))}
                                required
                                className="bg-background border-border text-foreground"
                            />
                            {formData.hourly_rate && (
                                <p className="text-[10px] text-brand font-bold uppercase tracking-tight">
                                    Coût Hôtel : {(parseFloat(formData.hourly_rate) * 1.15).toFixed(2)}€/h (+15%)
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Postes disponibles</Label>
                            <Input
                                type="number"
                                min="1"
                                value={formData.positions_available}
                                onChange={(e) => setFormData((prev) => ({ ...prev, positions_available: e.target.value }))}
                                required
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-foreground hover:bg-slate-100"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-brand hover:bg-brand/90 text-white font-bold px-8"
                        >
                            {loading ? "Création..." : "Créer la mission"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
