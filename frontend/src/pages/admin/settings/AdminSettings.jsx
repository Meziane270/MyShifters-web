// src/pages/admin/settings/AdminSettings.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Save, RefreshCw, UserPlus, Eye, EyeOff } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSettings() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ email: "", first_name: "", last_name: "", password: "", role: "admin" });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [createdAdminInfo, setCreatedAdminInfo] = useState(null);
    const [settings, setSettings] = useState({
        commission_rate: 0.15,
        min_payout_amount: 50,
        payout_delay_days: 7,
        maintenance_mode: false,
        allow_new_registrations: true,
        require_worker_documents: true,
        features: {
            reviews: true,
            disputes: true,
            worker_documents: true,
            hotel_verification: true
        }
    });

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/settings`, {
                headers: getAuthHeader()
            });
            setSettings(res.data);
        } catch (e) {
            toast.error("Impossible de charger les paramètres");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]); // ← DÉPENDANCE
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(
                `${API}/admin/settings`,
                settings,
                { headers: getAuthHeader() }
            );
            toast.success("Paramètres mis à jour");
        } catch (e) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (!newAdmin.email) { toast.error("Email requis"); return; }
        setCreatingAdmin(true);
        try {
            const res = await axios.post(`${API}/admin/users`, newAdmin, { headers: getAuthHeader() });
            toast.success(`Compte créé pour ${newAdmin.email}`);
            setCreatedAdminInfo({ email: newAdmin.email, password: res.data.generated_password });
            setNewAdmin({ email: "", first_name: "", last_name: "", password: "", role: "admin" });
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la création");
        } finally {
            setCreatingAdmin(false);
        }
    };
    const handleFeatureToggle = (feature, value) => {
        setSettings({
            ...settings,
            features: {
                ...settings.features,
                [feature]: value
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Paramètres plateforme
                    </h1>
                    <p className="text-foreground/70">
                        Configurez les paramètres généraux de MyShifters
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={fetchSettings}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Annuler
                    </Button>
                    <Button
                        className="bg-brand hover:bg-brand-light text-primary-foreground"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-background border border-border">
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="payments">Paiements</TabsTrigger>
                    <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
                    <TabsTrigger value="admins">Créer Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Paramètres généraux</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Configuration de base de la plateforme
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Mode maintenance</Label>
                                    <p className="text-sm text-foreground/70">
                                        Les utilisateurs ne pourront pas se connecter
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.maintenance_mode}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, maintenance_mode: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Nouvelles inscriptions</Label>
                                    <p className="text-sm text-foreground/70">
                                        Autoriser la création de nouveaux comptes
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.allow_new_registrations}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, allow_new_registrations: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Documents workers obligatoires</Label>
                                    <p className="text-sm text-foreground/70">
                                        Forcer l'upload de documents lors de l'inscription
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.require_worker_documents}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, require_worker_documents: checked })
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Paiements et commissions</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Configuration des aspects financiers
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="commission" className="text-foreground">
                                    Commission plateforme (%)
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="commission"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={settings.commission_rate * 100}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            commission_rate: parseFloat(e.target.value) / 100
                                        })}
                                        className="w-32 bg-background border-border"
                                    />
                                    <span className="text-foreground/70">%</span>
                                </div>
                                <p className="text-xs text-foreground/50">
                                    Prélevé sur chaque shift effectué
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min-payout" className="text-foreground">
                                    Paiement minimum (€)
                                </Label>
                                <Input
                                    id="min-payout"
                                    type="number"
                                    min="0"
                                    step="10"
                                    value={settings.min_payout_amount}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        min_payout_amount: parseFloat(e.target.value)
                                    })}
                                    className="w-32 bg-background border-border"
                                />
                                <p className="text-xs text-foreground/50">
                                    Montant minimum avant qu'un worker puisse demander un paiement
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payout-delay" className="text-foreground">
                                    Délai de paiement (jours)
                                </Label>
                                <Input
                                    id="payout-delay"
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={settings.payout_delay_days}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        payout_delay_days: parseInt(e.target.value)
                                    })}
                                    className="w-32 bg-background border-border"
                                />
                                <p className="text-xs text-foreground/50">
                                    Délai entre la fin du shift et le paiement
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Fonctionnalités</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Activer/désactiver des modules
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Avis clients</Label>
                                    <p className="text-sm text-foreground/70">
                                        Permettre aux clients de laisser des avis
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.features?.reviews}
                                    onCheckedChange={(checked) => handleFeatureToggle('reviews', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Litiges</Label>
                                    <p className="text-sm text-foreground/70">
                                        Système de résolution des conflits
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.features?.disputes}
                                    onCheckedChange={(checked) => handleFeatureToggle('disputes', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Documents workers</Label>
                                    <p className="text-sm text-foreground/70">
                                        Upload et vérification des documents
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.features?.worker_documents}
                                    onCheckedChange={(checked) => handleFeatureToggle('worker_documents', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-foreground">Vérification hôtels</Label>
                                    <p className="text-sm text-foreground/70">
                                        Processus de vérification des établissements
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.features?.hotel_verification}
                                    onCheckedChange={(checked) => handleFeatureToggle('hotel_verification', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="admins">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <UserPlus className="w-5 h-5" /> Créer un compte administrateur
                            </CardTitle>
                            <CardDescription className="text-foreground/70">
                                Créez un nouveau compte admin ou modérateur pour la plateforme.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {createdAdminInfo && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                    <p className="font-semibold text-emerald-700 mb-1">Compte créé avec succès !</p>
                                    <p className="text-sm">Email : <span className="font-mono font-bold">{createdAdminInfo.email}</span></p>
                                    {createdAdminInfo.password && (
                                        <p className="text-sm">Mot de passe généré : <span className="font-mono font-bold bg-white/50 px-2 py-0.5 rounded">{createdAdminInfo.password}</span></p>
                                    )}
                                    <p className="text-xs text-foreground/50 mt-1">Notez ce mot de passe, il ne sera plus affiché.</p>
                                    <Button size="sm" variant="outline" className="mt-2 border-border" onClick={() => setCreatedAdminInfo(null)}>Fermer</Button>
                                </div>
                            )}
                            <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Prénom</Label>
                                        <Input value={newAdmin.first_name} onChange={e => setNewAdmin({...newAdmin, first_name: e.target.value})} placeholder="Prénom" className="bg-background border-border" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Nom</Label>
                                        <Input value={newAdmin.last_name} onChange={e => setNewAdmin({...newAdmin, last_name: e.target.value})} placeholder="Nom" className="bg-background border-border" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Email *</Label>
                                    <Input type="email" required value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} placeholder="admin@myshifters.com" className="bg-background border-border" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Mot de passe <span className="text-foreground/50 text-xs">(laisser vide pour générer automatiquement)</span></Label>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} placeholder="Optionnel" className="bg-background border-border pr-10" />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Rôle</Label>
                                    <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                                        <option value="admin">Administrateur</option>
                                        <option value="moderator">Modérateur</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={creatingAdmin} className="bg-brand hover:bg-brand-light text-primary-foreground">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    {creatingAdmin ? "Création..." : "Créer le compte"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}