import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Save, Camera, Loader2, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import HotelAvatar from "../components/HotelAvatar";
import StatusBanner from "../components/StatusBanner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelProfilePage() {
    const { getAuthHeader, user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const avatarInputRef = useRef(null);
    const [formData, setFormData] = useState({
        responsible_name: "",
        phone: "",
        hotel_name: "",
        hotel_address: "",
        city: ""
    });

    useEffect(() => {
        if (user) {
            // Concatener first_name + last_name pour le nom du responsable
            const firstName = user.first_name || "";
            const lastName = user.last_name || "";
            const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.name || "";
            setFormData({
                responsible_name: fullName,
                phone: user.phone || "",
                hotel_name: user.hotel_name || "",
                hotel_address: user.hotel_address || "",
                city: user.city || ""
            });
        }
    }, [user]);

    const hasChanges = useMemo(() => {
        if (!user) return false;
        const firstName = user.first_name || "";
        const lastName = user.last_name || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.name || "";
        return (
            formData.responsible_name !== fullName ||
            formData.phone !== (user.phone || "") ||
            formData.hotel_name !== (user.hotel_name || "") ||
            formData.hotel_address !== (user.hotel_address || "") ||
            formData.city !== (user.city || "")
        );
    }, [formData, user]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAvatarChange = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("La photo ne doit pas depasser 10 Mo");
            return;
        }
        setAvatarLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await axios.post(
                `${API}/hotel/avatar`,
                fd,
                { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } }
            );
            setUser({ ...user, avatar_url: res.data.avatar_url });
            toast.success("Photo de profil mise a jour");
        } catch {
            toast.error("Erreur lors de l'upload de la photo");
        } finally {
            setAvatarLoading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = null;
        }
    }, [getAuthHeader, user, setUser]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!hasChanges) {
            toast.info("Aucune modification a enregistrer");
            return;
        }
        setLoading(true);
        try {
            // Separer le nom du responsable en first_name et last_name
            const parts = (formData.responsible_name || "").trim().split(/\s+/);
            const first_name = parts[0] || "";
            const last_name = parts.slice(1).join(" ") || "";
            const payload = {
                name: formData.responsible_name,
                first_name,
                last_name,
                phone: formData.phone,
                hotel_name: formData.hotel_name,
                hotel_address: formData.hotel_address,
                city: formData.city
            };
            await axios.put(
                `${API}/hotels/me`,
                payload,
                { headers: getAuthHeader() }
            );
            setUser({ ...user, ...payload });
            toast.success("Profil mis a jour avec succes");
        } catch {
            toast.error("Erreur lors de la mise a jour");
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
                            Gerez les informations de votre etablissement
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
                            <div className="relative group">
                                <HotelAvatar user={user} size={120} />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={avatarLoading}
                                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {avatarLoading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <p className="mt-4 text-sm text-foreground/70 text-center">
                                Logo ou photo de votre etablissement
                            </p>
                            <p className="mt-1 text-xs text-foreground/50 text-center">
                                Cliquez sur la photo pour modifier
                            </p>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={avatarLoading}
                                className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand border border-brand/30 rounded-lg hover:bg-brand/5 transition-colors disabled:opacity-50"
                            >
                                {avatarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                Changer la photo
                            </button>
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
                                    <Label htmlFor="hotel_name">Nom de l'etablissement</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="hotel_name"
                                            value={formData.hotel_name}
                                            onChange={(e) => handleChange("hotel_name", e.target.value)}
                                            className="bg-background border-border pl-10"
                                            placeholder="Hotel Le Grand Paris"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="responsible_name">Nom du responsable</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                        <Input
                                            id="responsible_name"
                                            value={formData.responsible_name}
                                            onChange={(e) => handleChange("responsible_name", e.target.value)}
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
                                        L'email ne peut pas etre modifie
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telephone</Label>
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
                                            placeholder="123 Avenue des Champs-Elysees"
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

                    {/* Statut de verification */}
                    <Card className="border-border bg-card mt-6">
                        <CardHeader>
                            <CardTitle className="text-foreground">Statut de verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-foreground font-medium">
                                        {user?.verification_status === "verified"
                                            ? "Compte verifie"
                                            : user?.verification_status === "rejected"
                                                ? "Verification refusee"
                                                : "En attente de verification"}
                                    </p>
                                    <p className="text-sm text-foreground/70 mt-1">
                                        {user?.verification_status === "verified"
                                            ? "Votre etablissement est verifie. Vous pouvez creer des missions."
                                            : user?.verification_status === "rejected"
                                                ? "Votre demande a ete refusee. Contactez le support."
                                                : "Notre equipe verifie vos informations. Ce processus prend generalement 24-48h."}
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
                                        ? "Verifie"
                                        : user?.verification_status === "rejected"
                                            ? "Refuse"
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
