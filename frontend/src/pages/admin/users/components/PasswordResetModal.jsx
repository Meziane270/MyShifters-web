// src/pages/admin/users/components/PasswordResetModal.jsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Key, Copy, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PasswordResetModal({ isOpen, onClose, user, onSuccess }) {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${API}/admin/users/${user.id}/reset-password`,
                {},
                { headers: getAuthHeader() }
            );
            setTempPassword(res.data.new_password || res.data.temp_password);
            toast.success("Mot de passe réinitialisé");
            onSuccess();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la réinitialisation");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(tempPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setTempPassword(null);
        setCopied(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Key className="w-5 h-5" />
                        Réinitialiser le mot de passe
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {tempPassword ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-500/10 rounded-lg">
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                    Mot de passe temporaire généré
                                </p>
                            </div>

                            <div className="p-4 bg-background border border-border rounded-lg">
                                <div className="text-xs text-foreground/60 mb-1">Mot de passe</div>
                                <div className="flex items-center justify-between">
                                    <code className="font-mono text-lg text-foreground">
                                        {tempPassword}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-border"
                                        onClick={handleCopy}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                                Copié
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copier
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    ℹ️ Ce mot de passe est temporaire. L'utilisateur devra le changer à sa prochaine connexion.
                                </p>
                            </div>

                            <p className="text-sm text-foreground/70">
                                Un email a été envoyé à <span className="font-medium text-foreground">{user.email}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-foreground/70">
                                Êtes-vous sûr de vouloir réinitialiser le mot de passe de <span className="font-semibold text-foreground">
                                    {user?.hotel_name || user?.name}
                                </span> ?
                            </p>
                            <div className="p-3 bg-orange-500/10 rounded-lg">
                                <p className="text-sm text-orange-700 dark:text-orange-400">
                                    ⚠️ Un mot de passe temporaire sera généré et envoyé par email.
                                    L'utilisateur devra le changer immédiatement.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-border"
                    >
                        {tempPassword ? "Fermer" : "Annuler"}
                    </Button>
                    {!tempPassword && (
                        <Button
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-brand hover:bg-brand-light text-primary-foreground"
                        >
                            {loading ? "Génération..." : "Réinitialiser"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}