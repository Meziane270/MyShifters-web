import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";   // ✅ 3 niveaux
import axios from "axios";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";   // ✅ (reste ../../..)
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import HotelAvatar from "../components/HotelAvatar";      // ✅ remonte 1 niveau
import StatusBanner from "../components/StatusBanner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelProfilePage() {
    const { getAuthHeader, user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        hotel_name: "",
        hotel_address: "",
        city: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                hotel_name: user.hotel_name || "",
                hotel_address: user.hotel_address || "",
                city: user.city || ""
            });
        }
    }, [user]);

    const hasChanges = useMemo(() => {
        if (!user) return false;
        return (
            formData.name !== (user.name || "") ||
            formData.phone !== (user.phone || "") ||
            formData.hotel_name !== (user.hotel_name || "") ||
            formData.hotel_address !== (user.hotel_address || "") ||
            formData.city !== (user.city || "")
        );
    }, [formData, user]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!hasChanges) {
            toast.info("Aucune modification à enregistrer");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${API}/hotels/me`,
                formData,
                { headers: getAuthHeader() }
            );

            // Mettre à jour le contexte utilisateur
            setUser({
                ...user,
                ...formData
            });

            toast.success("Profil mis à jour avec succès");
        } catch {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    }, [formData, getAuthHeader, hasChanges, user, setUser]);

    return (
        <div className="space-y-8" data-testid="hotel-profile-page">
            <div>
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Mon profil
                        </h1>
                        <p className="text-foreground/70 mt-1">
                            Gérez les informations de votre établissement
                        </p>
                    </div>
                </div>
            </div>

            <StatusBanner user={user} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Carte avatar et statut */}
                <div className="lg:col-span-1">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Photo de profil</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <HotelAvatar user={user} size={120} />
                            <p className="mt-4 text-sm text-foreground/70 text-center">
                                Logo ou photo de votre établissement
                            </p>
                            <p className="mt-2 text-xs text-foreground/50">
                                Format carré recommandé
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Formulaire profil */}
                <div className="lg:col-span-2">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Informations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hotel_name">Nom de l'établissement</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="hotel_name"
                                            value={formData.hotel_name}
                                            onChange={(e) => handleChange("hotel_name", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="Hôtel Le Grand Paris"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom du responsable</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="Jean Dupont"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user?.email || ""}
                                            disabled
                                            className="bg-background/50 border-border pl-10 text-foreground/70"
                                        />
                                    </div>
                                    <p className="text-xs text-foreground/50">
                                        L'email ne peut pas être modifié
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hotel_address">Adresse</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="hotel_address"
                                            value={formData.hotel_address}
                                            onChange={(e) => handleChange("hotel_address", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="123 Avenue des Champs-Élysées"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => handleChange("city", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="Paris"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={loading || !hasChanges}
                                        className="bg-brand hover:bg-brand-light text-primary-foreground"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Enregistrer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Statut de vérification */}
                    <Card className="border-border bg-card mt-6">
                        <CardHeader>
                            <CardTitle className="text-foreground">Statut de vérification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-foreground font-medium">
                                        {user?.verification_status === "verified"
                                            ? "Compte vérifié"
                                            : user?.verification_status === "rejected"
                                                ? "Vérification refusée"
                                                : "En attente de vérification"}
                                    </p>
                                    <p className="text-sm text-foreground/70 mt-1">
                                        {user?.verification_status === "verified"
                                            ? "Votre établissement est vérifié. Vous pouvez créer des missions."
                                            : user?.verification_status === "rejected"
                                                ? "Votre demande a été refusée. Contactez le support."
                                                : "Notre équipe vérifie vos informations. Ce processus prend généralement 24-48h."}
                                    </p>
                                </div>
                                <Badge
                                    className={
                                        user?.verification_status === "verified"
                                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"
                                            : user?.verification_status === "rejected"
                                                ? "bg-red-500/15 text-red-700 dark:text-red-400 border-0"
                                                : "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-0"
                                    }
                                >
                                    {user?.verification_status === "verified"
                                        ? "Vérifié"
                                        : user?.verification_status === "rejected"
                                            ? "Refusé"
                                            : "En attente"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}