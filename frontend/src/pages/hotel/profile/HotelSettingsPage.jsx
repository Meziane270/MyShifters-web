import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { Settings, Bell, Mail, Phone, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelSettingsPage() {
    const { getAuthHeader, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        billing_email: "",
        billing_address: "",
        vat_number: "",
        notifications_email: true,
        notifications_sms: false
    });

    const fetchSettings = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/hotels/settings`, {
                headers: getAuthHeader()
            });
            setSettings(prev => ({
                ...prev,
                ...res.data
            }));
        } catch {
            toast.error("Erreur lors du chargement des paramètres");
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = useCallback((field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(
                `${API}/hotels/settings`,
                settings,
                { headers: getAuthHeader() }
            );
            toast.success("Paramètres mis à jour");
        } catch {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    }, [settings, getAuthHeader]);

    return (
        <div className="space-y-8" data-testid="hotel-settings-page">
            <div>
                <div className="flex items-center gap-3">
                    <Settings className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Paramètres
                        </h1>
                        <p className="text-foreground/70 mt-1">
                            Gérez vos préférences et informations de facturation
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="billing" className="space-y-6">
                <TabsList className="bg-card border-border">
                    <TabsTrigger value="billing" className="data-[state=active]:bg-brand/10">
                        Facturation
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-brand/10">
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="billing">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Informations de facturation</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Ces informations apparaîtront sur vos factures
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="billing_email">Email de facturation</Label>
                                    <Input
                                        id="billing_email"
                                        type="email"
                                        value={settings.billing_email || ""}
                                        onChange={(e) => handleChange("billing_email", e.target.value)}
                                        className="bg-background border-border"
                                        placeholder={user?.email || "contact@hotel.com"}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_address">Adresse de facturation</Label>
                                    <Input
                                        id="billing_address"
                                        value={settings.billing_address || ""}
                                        onChange={(e) => handleChange("billing_address", e.target.value)}
                                        className="bg-background border-border"
                                        placeholder="Adresse complète"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="vat_number">Numéro de TVA (optionnel)</Label>
                                    <Input
                                        id="vat_number"
                                        value={settings.vat_number || ""}
                                        onChange={(e) => handleChange("vat_number", e.target.value)}
                                        className="bg-background border-border"
                                        placeholder="FR12345678900"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={loading}
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
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Notifications</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Choisissez comment vous souhaitez être notifié
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-foreground/50 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-foreground">Notifications email</p>
                                        <p className="text-sm text-foreground/70">
                                            Recevoir les candidatures par email
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.notifications_email}
                                    onCheckedChange={(checked) => handleChange("notifications_email", checked)}
                                    className="data-[state=checked]:bg-brand"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-foreground/50 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-foreground">Notifications SMS</p>
                                        <p className="text-sm text-foreground/70">
                                            Recevoir les candidatures par SMS
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.notifications_sms}
                                    onCheckedChange={(checked) => handleChange("notifications_sms", checked)}
                                    className="data-[state=checked]:bg-brand"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}