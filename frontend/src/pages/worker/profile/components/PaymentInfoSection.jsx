import React, { useState, useEffect } from "react";
import { CreditCard, Building, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentInfoSection({
                                               payoutAccount,
                                               aeInfo,
                                               profile,
                                               onSavePayout,
                                               onSaveAe,
                                               saving
                                           }) {
    // États locaux pour les formulaires
    const [payoutForm, setPayoutForm] = useState({
        iban: "",
        bic: "",
        status: "pending"
    });

    const [aeForm, setAeForm] = useState({
        has_ae_status: false,
        siret: "",
        billing_address: "",
        billing_city: "",
        billing_postal_code: "",
        same_as_personal: false
    });

    // Synchronisation avec les props
    useEffect(() => {
        if (payoutAccount) {
            setPayoutForm({
                iban: payoutAccount.iban || "",
                bic: payoutAccount.bic || "",
                status: payoutAccount.status || "pending"
            });
        }
    }, [payoutAccount]);

    useEffect(() => {
        if (aeInfo) {
            setAeForm({
                has_ae_status: true,
                siret: aeInfo.siret || profile?.siret || "",
                billing_address: aeInfo.billing_address || profile?.billing_address || profile?.address || "",
                billing_city: aeInfo.billing_city || profile?.billing_city || profile?.city || "",
                billing_postal_code: aeInfo.billing_postal_code || profile?.billing_postal_code || profile?.postal_code || "",
                same_as_personal: aeInfo.same_as_personal || false
            });
        }
    }, [aeInfo, profile]);

    // Gestionnaires de changement
    const handlePayoutChange = (e) => {
        const { name, value } = e.target;
        setPayoutForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAeForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSameAsPersonal = (checked) => {
        setAeForm(prev => ({ ...prev, same_as_personal: checked }));
    };

    // Soumissions
    const handlePayoutSubmit = async (e) => {
        e.preventDefault();
        if (!payoutForm.iban || !payoutForm.bic) {
            toast.error("L'IBAN et le BIC sont requis");
            return;
        }
        await onSavePayout(payoutForm);
    };

    const handleAeSubmit = async (e) => {
        e.preventDefault();
        if (aeForm.has_ae_status && !aeForm.siret) {
            toast.error("Le SIRET est requis si vous avez le statut AE");
            return;
        }
        await onSaveAe(aeForm);
    };

    return (
        <div className="space-y-10 p-10">
            {/* Section Rémunération */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2 bg-brand/10 text-brand rounded-xl">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Rémunération</h2>
                </div>
                <div className="p-8">
                    {payoutAccount?.status === 'verified' && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm text-emerald-800 font-medium">
                                Votre compte de paiement est vérifié.
                            </p>
                        </div>
                    )}
                    {payoutAccount?.status === 'rejected' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-800 font-medium">
                                Votre RIB a été rejeté. Veuillez fournir un document valide.
                            </p>
                        </div>
                    )}
                    <form onSubmit={handlePayoutSubmit} className="space-y-6">
                        <div className="max-w-2xl space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">IBAN</label>
                                <input
                                    type="text"
                                    name="iban"
                                    value={payoutForm.iban}
                                    onChange={handlePayoutChange}
                                    placeholder="FR76 0000 0000 0000 0000 0000 000"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">BIC / SWIFT</label>
                                <input
                                    type="text"
                                    name="bic"
                                    value={payoutForm.bic}
                                    onChange={handlePayoutChange}
                                    placeholder="XXXXXXXX"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving.payout}
                                className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-light transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                            >
                                {saving.payout ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Enregistrer mon RIB
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Section Informations AE */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2 bg-brand/10 text-brand rounded-xl">
                        <Building className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Informations AE</h2>
                </div>
                <div className="p-8">
                    <form onSubmit={handleAeSubmit} className="space-y-6">
                        <div className="space-y-4 border-l-2 border-brand/30 pl-6 ml-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Numéro SIRET</label>
                                <input
                                    type="text"
                                    name="siret"
                                    value={aeForm.siret}
                                    onChange={handleAeChange}
                                    placeholder="14 chiffres"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Adresse de facturation</label>
                                <input
                                    type="text"
                                    name="billing_address"
                                    value={aeForm.billing_address}
                                    onChange={handleAeChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Ville (facturation)</label>
                                    <input
                                        type="text"
                                        name="billing_city"
                                        value={aeForm.billing_city}
                                        onChange={handleAeChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Code postal</label>
                                    <input
                                        type="text"
                                        name="billing_postal_code"
                                        value={aeForm.billing_postal_code}
                                        onChange={handleAeChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="same_as_personal"
                                    name="same_as_personal"
                                    checked={aeForm.same_as_personal}
                                    onChange={(e) => handleSameAsPersonal(e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
                                />
                                <label htmlFor="same_as_personal" className="text-sm text-slate-600">
                                    Même que mon adresse personnelle
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving.ae}
                                className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-light transition-all flex items-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50"
                            >
                                {saving.ae ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Mettre à jour les infos AE
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
