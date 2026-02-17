import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    FileText, 
    Download, 
    Calendar, 
    Clock, 
    Loader2,
    CheckCircle2,
    Clock4,
    Send,
    TrendingUp,
    Building2
} from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { toast } from "sonner";

export default function InvoicesPage() {
    const { fetchData, postData, loading } = useWorkerData();
    const [invoices, setInvoices] = useState([]);
    const [applications, setApplications] = useState([]);
    const [earnings, setEarnings] = useState({ total: 0, paid: 0, pending: 0 });
    const [activeTab, setActiveTab] = useState("to_transmit");

    const loadData = useCallback(async () => {
        try {
            const [invs, apps, earn] = await Promise.all([
                fetchData('/worker/invoices').catch(() => []),
                fetchData('/applications/worker').catch(() => []),
                fetchData('/worker/earnings').catch(() => ({ total: 0, paid: 0, pending: 0 }))
            ]);
            setInvoices(invs || []);
            setApplications(apps || []);
            setEarnings(earn);
        } catch (err) {
            console.error("Erreur chargement données financières:", err);
        }
    }, [fetchData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUploadInvoice = async (missionId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('mission_id', missionId);
            
            try {
                await postData('/worker/invoices', formData, true);
                toast.success("Facture transmise avec succès !");
                loadData();
            } catch (err) {
                toast.error("Erreur lors de l'envoi de la facture");
            }
        };
        input.click();
    };

    const toTransmit = useMemo(() => {
        return applications.filter(app => 
            app.status === "completed" && 
            !invoices.some(inv => inv.mission_id === app.shift_id)
        );
    }, [applications, invoices]);

    const pendingPayment = useMemo(() => {
        return invoices.filter(inv => inv.status === 'pending');
    }, [invoices]);

    const paidInvoices = useMemo(() => {
        return invoices.filter(inv => inv.status === 'paid');
    }, [invoices]);

    if (loading && applications.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Chargement de vos factures...</p>
            </div>
        );
    }

    const InvoiceCard = ({ item, type }) => {
        const hotelName = item.hotel_name || item.shift?.hotel_name || "Hôtel Partenaire";
        const date = item.shift_date || item.shift?.date || "Date non spécifiée";
        const hours = item.shift_start_time ? `${item.shift_start_time} - ${item.shift_end_time}` : (item.shift?.start_time ? `${item.shift.start_time} - ${item.shift.end_time}` : "");
        const amount = item.amount || (item.shift?.hourly_rate ? item.shift.hourly_rate * 7 : 0);

        return (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-8 flex-1">
                    <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner transition-all ${
                        type === 'paid' ? 'bg-emerald-50 text-emerald-500' : 
                        type === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-brand/5 text-brand'
                    }`}>
                        <FileText className="h-10 w-10" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-900 text-xl tracking-tight">{hotelName}</h4>
                            {type === 'paid' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Payé</span>}
                            {type === 'pending' && <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest">En attente</span>}
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                <Calendar className="h-4 w-4 text-brand" />
                                {date}
                            </div>
                            {hours && (
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                    <Clock className="h-4 w-4 text-brand" />
                                    {hours}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-50">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant TTC</p>
                        <p className="text-3xl font-black text-brand tracking-tighter">{amount?.toLocaleString('fr-FR')} €</p>
                    </div>
                    {type === 'to_transmit' ? (
                        <button 
                            onClick={() => handleUploadInvoice(item.shift_id)}
                            className="h-16 px-8 bg-brand text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-brand-light transition-all shadow-xl shadow-brand/20"
                        >
                            <Send className="h-5 w-5" />
                            Transmettre
                        </button>
                    ) : (
                        <a 
                            href={item.url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-16 w-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand transition-all shadow-xl shadow-slate-200 hover:shadow-brand/20"
                        >
                            <Download className="h-7 w-7" />
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Mes Factures</h1>
                    <p className="text-slate-500 font-medium">Gérez vos paiements et transmettez vos factures.</p>
                </div>
                
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CA Réel Total</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{earnings.total?.toLocaleString('fr-FR')} €</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                {[
                    { id: 'to_transmit', label: 'Facture à transmettre', icon: Send, color: 'text-brand' },
                    { id: 'pending', label: 'En attente de paiement', icon: Clock4, color: 'text-orange-500' },
                    { id: 'paid', label: 'Payées', icon: CheckCircle2, color: 'text-emerald-500' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-brand text-white shadow-xl shadow-brand/20' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {activeTab === 'to_transmit' && (
                    <div className="space-y-4">
                        {toTransmit.length > 0 ? (
                            toTransmit.map((app) => <InvoiceCard key={app.id} item={app} type="to_transmit" />)
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <FileText className="h-10 w-10" />
                                </div>
                                <p className="text-slate-400 font-bold">Aucune facture à transmettre pour le moment.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {pendingPayment.length > 0 ? (
                            pendingPayment.map((inv) => <InvoiceCard key={inv.id} item={inv} type="pending" />)
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <Clock4 className="h-10 w-10" />
                                </div>
                                <p className="text-slate-400 font-bold">Aucune facture en attente de paiement.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'paid' && (
                    <div className="space-y-4">
                        {paidInvoices.length > 0 ? (
                            paidInvoices.map((inv) => <InvoiceCard key={inv.id} item={inv} type="paid" />)
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <p className="text-slate-400 font-bold">Aucune facture payée pour le moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
