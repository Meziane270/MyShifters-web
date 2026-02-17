// src/pages/admin/verifications/components/VerificationModal.jsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { AlertTriangle } from "lucide-react";

export default function VerificationModal({ isOpen, onClose, user, type, onConfirm }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const isApproval = type === 'approve';
    const userName = user.hotel_name || user.name;

    const handleConfirm = async () => {
        if (!isApproval && !reason.trim()) {
            return;
        }
        setLoading(true);
        await onConfirm(user.id, isApproval ? 'verified' : 'rejected', reason);
        setLoading(false);
        setReason("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isApproval ? 'Approuver' : 'Rejeter'} la vérification
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {isApproval ? (
                        <p className="text-foreground/70">
                            Êtes-vous sûr de vouloir approuver <span className="font-semibold text-foreground">{userName}</span> ?
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-orange-700 dark:text-orange-400">
                                    Cette action enverra un email à l'utilisateur et il devra recommencer son inscription.
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    Motif du rejet <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Documents manquants, informations incorrectes..."
                                    className="bg-background border-border"
                                    rows={4}
                                />
                            </div>
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
                        onClick={handleConfirm}
                        disabled={loading || (!isApproval && !reason.trim())}
                        className={isApproval
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-red-600 hover:bg-red-500 text-white"
                        }
                    >
                        {loading ? "Traitement..." : isApproval ? "Approuver" : "Rejeter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}