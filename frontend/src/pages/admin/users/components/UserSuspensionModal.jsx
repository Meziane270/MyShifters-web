// src/pages/admin/users/components/UserSuspensionModal.jsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { AlertTriangle, Ban } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function UserSuspensionModal({ isOpen, onClose, user, isSuspended, onSuccess }) {
    const { getAuthHeader } = useAuth();
    const [reason, setReason] = useState("");
    const [expiresInDays, setExpiresInDays] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSuspend = async () => {
        if (!reason.trim()) return;

        setLoading(true);
        try {
            await axios.post(
                `${API}/admin/suspensions`,
                {
                    user_id: user.id,
                    reason: reason.trim(),
                    expires_in_days: expiresInDays ? parseInt(expiresInDays) : null
                },
                { headers: getAuthHeader() }
            );
            toast.success("Utilisateur suspendu");
            onSuccess();
            onClose();
            setReason("");
            setExpiresInDays("");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la suspension");
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!reason.trim()) return;

        setLoading(true);
        try {
            // Récupérer la suspension active
            const suspensions = await axios.get(`${API}/admin/suspensions/active`, {
                headers: getAuthHeader()
            });
            const activeSuspension = suspensions.data.find(s => s.user_id === user.id);

            if (activeSuspension) {
                await axios.post(
                    `${API}/admin/suspensions/${activeSuspension.id}/revoke`,
                    { reason: reason.trim() },
                    { headers: getAuthHeader() }
                );
                toast.success("Suspension levée");
                onSuccess();
                onClose();
                setReason("");
            }
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la révocation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        {isSuspended ? (
                            <>
                                <Ban className="w-5 h-5" />
                                Lever la suspension
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Suspendre l'utilisateur
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            {isSuspended
                                ? "L'utilisateur pourra immédiatement se reconnecter."
                                : "L'utilisateur ne pourra plus se connecter ni effectuer d'actions sur la plateforme."}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="reason" className="text-foreground">
                            Motif <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isSuspended
                                ? "Raison de la levée de suspension..."
                                : "Non-paiement, comportement inapproprié, documents frauduleux..."
                            }
                            className="mt-1.5 bg-background border-border"
                            rows={4}
                        />
                    </div>

                    {!isSuspended && (
                        <div>
                            <Label htmlFor="expires" className="text-foreground">
                                Expiration (optionnel)
                            </Label>
                            <Input
                                id="expires"
                                type="number"
                                min="1"
                                max="365"
                                value={expiresInDays}
                                onChange={(e) => setExpiresInDays(e.target.value)}
                                placeholder="Nombre de jours"
                                className="mt-1.5 bg-background border-border"
                            />
                            <p className="text-xs text-foreground/50 mt-1">
                                Laissez vide pour une suspension permanente
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-border"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={isSuspended ? handleRevoke : handleSuspend}
                        disabled={loading || !reason.trim()}
                        className={isSuspended
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-red-600 hover:bg-red-500 text-white"
                        }
                    >
                        {loading ? "Traitement..." : isSuspended ? "Lever la suspension" : "Suspendre"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}