// src/pages/admin/disputes/components/ResolveDisputeModal.jsx
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { CheckCircle, DollarSign } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResolveDisputeModal({ isOpen, onClose, dispute, onSuccess }) {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [resolution, setResolution] = useState({
        status: "resolved_hotel",
        note: "",
        refund_amount: 0
    });

    const handleResolve = async () => {
        if (!resolution.note.trim()) return;

        setLoading(true);
        try {
            await axios.put(
                `${API}/admin/disputes/${dispute.id}/resolve`,
                resolution,
                { headers: getAuthHeader() }
            );
            toast.success("Litige résolu");
            onSuccess();
            onClose();
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Erreur lors de la résolution");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Résoudre le litige
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="status" className="text-foreground">
                            Décision
                        </Label>
                        <Select
                            value={resolution.status}
                            onValueChange={(value) => setResolution({ ...resolution, status: value })}
                        >
                            <SelectTrigger id="status" className="mt-1.5 bg-background border-border">
                                <SelectValue placeholder="Choisir une décision" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="resolved_hotel">En faveur de l'hôtel</SelectItem>
                                <SelectItem value="resolved_worker">En faveur du worker</SelectItem>
                                <SelectItem value="rejected">Rejeter le litige</SelectItem>
                                <SelectItem value="refunded">Remboursement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(resolution.status === 'resolved_worker' || resolution.status === 'refunded') && (
                        <div>
                            <Label htmlFor="refund" className="text-foreground">
                                Montant du remboursement (€)
                            </Label>
                            <div className="relative mt-1.5">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                                <Input
                                    id="refund"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={resolution.refund_amount}
                                    onChange={(e) => setResolution({
                                        ...resolution,
                                        refund_amount: parseFloat(e.target.value) || 0
                                    })}
                                    className="pl-9 bg-background border-border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="note" className="text-foreground">
                            Note de résolution <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="note"
                            value={resolution.note}
                            onChange={(e) => setResolution({ ...resolution, note: e.target.value })}
                            placeholder="Expliquez votre décision..."
                            className="mt-1.5 bg-background border-border"
                            rows={4}
                        />
                    </div>
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
                        onClick={handleResolve}
                        disabled={loading || !resolution.note.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {loading ? "Traitement..." : "Confirmer la résolution"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}