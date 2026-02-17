// src/pages/admin/notifications/AdminNotifications.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import StatusPill from "../components/StatusPill";
import {
    Send,
    RefreshCw,
    Bell,
    Users,
    Hotel,
    Briefcase,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminNotifications() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        target_role: "",
        priority: "normal",
        scheduled_at: ""
    });

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/admin/notifications`, {
                headers: getAuthHeader()
            });
            setNotifications(res.data || []);
        } catch (e) {
            toast.error("Impossible de charger les notifications");
        }
    }, [getAuthHeader]); // ← DÉPENDANCE
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API}/admin/notifications`,
                formData,
                { headers: getAuthHeader() }
            );
            toast.success("Notification envoyée");
            setFormData({
                title: "",
                message: "",
                target_role: "",
                priority: "normal",
                scheduled_at: ""
            });
            fetchNotifications();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/15 text-red-700 dark:text-red-400';
            case 'high': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400';
            case 'normal': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
            case 'low': return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
            default: return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300';
        }
    };

    const getTargetLabel = (target) => {
        if (!target) return 'Tous les utilisateurs';
        switch (target) {
            case 'hotel': return 'Hôtels uniquement';
            case 'worker': return 'Workers uniquement';
            case 'admin': return 'Admins uniquement';
            default: return target;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                    Notifications
                </h1>
                <p className="text-foreground/70">
                    Envoyez des notifications à tous les utilisateurs
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Create notification */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Bell className="w-5 h-5" />
                            Nouvelle notification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-foreground">
                                    Titre <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Maintenance, Nouvelle fonctionnalité..."
                                    className="mt-1.5 bg-background border-border"
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <Label htmlFor="message" className="text-foreground">
                                    Message <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Contenu de votre notification..."
                                    className="mt-1.5 bg-background border-border"
                                    rows={4}
                                    maxLength={2000}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="target" className="text-foreground">
                                        Destinataires
                                    </Label>
                                    <Select
                                        value={formData.target_role}
                                        onValueChange={(value) => setFormData({ ...formData, target_role: value })}
                                    >
                                        <SelectTrigger id="target" className="mt-1.5 bg-background border-border">
                                            <SelectValue placeholder="Tous" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les utilisateurs</SelectItem>
                                            <SelectItem value="hotel">Hôtels uniquement</SelectItem>
                                            <SelectItem value="worker">Workers uniquement</SelectItem>
                                            <SelectItem value="admin">Admins uniquement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="priority" className="text-foreground">
                                        Priorité
                                    </Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger id="priority" className="mt-1.5 bg-background border-border">
                                            <SelectValue placeholder="Normale" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Basse</SelectItem>
                                            <SelectItem value="normal">Normale</SelectItem>
                                            <SelectItem value="high">Haute</SelectItem>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="schedule" className="text-foreground">
                                    Planification (optionnel)
                                </Label>
                                <Input
                                    id="schedule"
                                    type="datetime-local"
                                    value={formData.scheduled_at}
                                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                    className="mt-1.5 bg-background border-border"
                                />
                                <p className="text-xs text-foreground/50 mt-1">
                                    Laissez vide pour envoyer immédiatement
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-brand hover:bg-brand-light text-primary-foreground"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                {loading ? "Envoi..." : "Envoyer la notification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Recent notifications */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Historique
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-border"
                                onClick={fetchNotifications}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-foreground/70">
                                    <Bell className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                                    <p>Aucune notification envoyée</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="p-4 bg-background rounded-lg border border-border"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(notif.priority)}>
                                                    {notif.priority}
                                                </Badge>
                                                {notif.sent_at ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Envoyé
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-0">
                                                        Planifié
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-foreground/50">
                                                {new Date(notif.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        <h4 className="font-medium text-foreground mb-1">
                                            {notif.title}
                                        </h4>
                                        <p className="text-sm text-foreground/70 mb-2">
                                            {notif.message}
                                        </p>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1 text-foreground/50">
                                                {!notif.target_role ? (
                                                    <>
                                                        <Users className="w-3 h-3" />
                                                        <span>Tous</span>
                                                    </>
                                                ) : notif.target_role === 'hotel' ? (
                                                    <>
                                                        <Hotel className="w-3 h-3" />
                                                        <span>Hôtels</span>
                                                    </>
                                                ) : notif.target_role === 'worker' ? (
                                                    <>
                                                        <Briefcase className="w-3 h-3" />
                                                        <span>Workers</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Users className="w-3 h-3" />
                                                        <span>Admins</span>
                                                    </>
                                                )}
                                            </div>
                                            <span className="text-foreground/50">
                                                Par {notif.created_by_email}
                                            </span>
                                        </div>

                                        {notif.scheduled_at && !notif.sent_at && (
                                            <div className="mt-2 pt-2 border-t border-border flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    Planifié le {new Date(notif.scheduled_at).toLocaleString('fr-FR')}
                                                </span>
                                            </div>
                                        )}

                                        {notif.read_by && (
                                            <div className="mt-2 text-xs text-foreground/50">
                                                {notif.read_by.length} lecture{notif.read_by.length > 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}