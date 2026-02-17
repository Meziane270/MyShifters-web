import { useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { LifeBuoy, Send, MessageSquare, Mail, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelSupportPage() {
    const { getAuthHeader, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        message: ""
    });
    const [recentTickets, setRecentTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);

    const fetchTickets = useCallback(async () => {
        setLoadingTickets(true);
        try {
            const res = await axios.get(`${API}/support/threads/me`, {
                headers: getAuthHeader()
            });
            setRecentTickets(res.data.slice(0, 3));
        } catch {
            // Silently fail - pas critique
        } finally {
            setLoadingTickets(false);
        }
    }, [getAuthHeader]);

    useState(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API}/support/threads`,
                formData,
                { headers: getAuthHeader() }
            );

            toast.success("Message envoyé ! Notre équipe vous répondra dans les plus brefs délais.");
            setFormData({ subject: "", message: "" });
            fetchTickets();
        } catch {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setLoading(false);
        }
    }, [formData, getAuthHeader, fetchTickets]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return dateString;
        }
    }, []);

    return (
        <div className="space-y-8" data-testid="hotel-support-page">
            <div>
                <div className="flex items-center gap-3">
                    <LifeBuoy className="w-8 h-8 text-brand" />
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            Support
                        </h1>
                        <p className="text-foreground/70 mt-1">
                            Besoin d'aide ? Notre équipe est là pour vous
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Formulaire de contact */}
                <div className="lg:col-span-2">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Nous contacter</CardTitle>
                            <CardDescription className="text-foreground/70">
                                Remplissez le formulaire ci-dessous pour créer un ticket de support
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Sujet</Label>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleChange("subject", e.target.value)}
                                        className="bg-background border-border"
                                        placeholder="Résumé de votre demande"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => handleChange("message", e.target.value)}
                                        className="bg-background border-border min-h-[150px]"
                                        placeholder="Décrivez votre problème en détail..."
                                        required
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
                                                <Send className="w-4 h-4 mr-2" />
                                                Envoyer
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Informations de contact et tickets récents */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact direct */}
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Contact direct</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <a
                                href="mailto:support@myshifters.com"
                                className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-brand/30 transition-colors"
                            >
                                <Mail className="w-5 h-5 text-brand" />
                                <div>
                                    <p className="font-medium text-foreground">Email</p>
                                    <p className="text-sm text-foreground/70">support@myshifters.com</p>
                                </div>
                            </a>
                            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                                <Clock className="w-5 h-5 text-brand" />
                                <div>
                                    <p className="font-medium text-foreground">Délai de réponse</p>
                                    <p className="text-sm text-foreground/70">24-48h ouvrées</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tickets récents */}
                    {recentTickets.length > 0 && (
                        <Card className="border-border bg-card">
                            <CardHeader>
                                <CardTitle className="text-foreground">Demandes récentes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="p-3 bg-background rounded-lg border border-border"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className="font-medium text-foreground text-sm line-clamp-1">
                                                {ticket.subject}
                                            </span>
                                            <Badge
                                                className={
                                                    ticket.status === "open"
                                                        ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-0"
                                                        : ticket.status === "pending"
                                                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0"
                                                            : "bg-foreground/10 text-foreground/70 border-0"
                                                }
                                            >
                                                {ticket.status === "open" ? "Ouvert" :
                                                    ticket.status === "pending" ? "En cours" : "Fermé"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-foreground/50">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>{formatDate(ticket.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* FAQ */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-foreground">Foire aux questions</CardTitle>
                    <CardDescription className="text-foreground/70">
                        Réponses aux questions les plus fréquentes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">
                                Pourquoi je ne peux pas créer de mission ?
                            </h3>
                            <p className="text-sm text-foreground/70">
                                Votre établissement doit être vérifié par notre équipe avant de pouvoir publier des missions.
                                Ce processus prend généralement 24-48h.
                            </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">
                                Comment modifier mes informations ?
                            </h3>
                            <p className="text-sm text-foreground/70">
                                Rendez-vous dans la section "Mon Profil" pour mettre à jour les informations de votre établissement.
                            </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">
                                Où trouver mes factures ?
                            </h3>
                            <p className="text-sm text-foreground/70">
                                Les factures sont disponibles dans la section "Mes Factures" après la complétion des missions.
                            </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <h3 className="font-semibold text-foreground mb-2">
                                Comment contacter un candidat ?
                            </h3>
                            <p className="text-sm text-foreground/70">
                                Une fois une candidature acceptée, vous pouvez voir ses coordonnées dans la section "Candidatures".
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}