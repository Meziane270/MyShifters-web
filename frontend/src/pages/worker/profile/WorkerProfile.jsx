import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    User, 
    Briefcase, 
    CreditCard, 
    FileText, 
    Loader2
} from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

// Sous-composants
import PersonalInfoForm from './components/PersonalInfoForm';
import ExperienceList from './components/ExperienceList';
import DocumentList from './components/DocumentList';
import PaymentInfoSection from './components/PaymentInfoSection';

export default function WorkerProfile() {
    const { fetchData, putData, postData, deleteData, loading: globalLoading } = useWorkerData();
    const { updateUserData } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [payoutAccount, setPayoutAccount] = useState({ iban: "", bic: "", status: "pending" });
    const [aeInfo, setAeInfo] = useState({ has_ae_status: false, siret: "", billing_address: "" });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [activeTab, setActiveTab] = useState("personal");

    const loadAllProfileData = useCallback(async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                fetchData('/worker/profile'),
                fetchData('/worker/experiences'),
                fetchData('/worker/documents'),
                fetchData('/worker/payout-account'),
                fetchData('/worker/business')
            ]);

            if (results[0].status === 'fulfilled') {
                setProfile(results[0].value);
                // Mise à jour du contexte auth avec les dernières données du profil
                if (results[0].value) {
                    updateUserData(results[0].value);
                }
            }
            if (results[1].status === 'fulfilled') setExperiences(results[1].value || []);
            if (results[2].status === 'fulfilled') setDocuments(results[2].value || []);
            if (results[3].status === 'fulfilled') setPayoutAccount(results[3].value || { iban: "", bic: "", status: "pending" });
            if (results[4].status === 'fulfilled') setAeInfo(results[4].value || { has_ae_status: false, siret: "", billing_address: "" });

        } catch (err) {
            console.error("Erreur critique profil:", err);
            toast.error("Erreur lors de l'initialisation du profil");
        } finally {
            setLoading(false);
        }
    }, [fetchData, updateUserData]);

    useEffect(() => {
        loadAllProfileData();
    }, [loadAllProfileData]);

    const completionStats = useMemo(() => {
        const steps = [
            { label: "Infos Personnelles", done: !!profile?.phone && !!profile?.address },
            { label: "Expériences", done: experiences.length > 0 },
            { label: "RIB / Paiement", done: !!payoutAccount?.iban },
            { label: "Statut AE", done: !!aeInfo?.siret }
        ];
        const completed = steps.filter(s => s.done).length;
        const percent = Math.round((completed / steps.length) * 100);
        return { steps, percent, isComplete: completed === steps.length };
    }, [profile, experiences, payoutAccount, aeInfo]);

    const handleSave = async (section, endpoint, data, method = 'put', isMultipart = false) => {
        setSaving(prev => ({ ...prev, [section]: true }));
        try {
            if (section === 'profile' && isMultipart) {
                await postData('/worker/avatar', data, true);
            } else if (method === 'put') {
                await putData(endpoint, data);
            } else if (method === 'post') {
                await postData(endpoint, data, isMultipart);
            } else if (method === 'delete') {
                await deleteData(endpoint);
            }
            
            toast.success("Mise à jour réussie");
            loadAllProfileData();
        } catch (err) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(prev => ({ ...prev, [section]: false }));
        }
    };

    if (loading && !profile) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Chargement de votre profil...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Mon Profil</h1>
                    <p className="text-slate-500 font-medium">Gérez vos informations et suivez votre statut de vérification.</p>
                </div>
                
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="relative h-16 w-16">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-brand transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${completionStats.percent}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-slate-900">{completionStats.percent}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Complétion du profil</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                            {completionStats.percent === 100 ? "Profil Complet ✨" : "Profil à compléter"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                {[
                    { id: 'personal', label: 'Informations Personnelles', icon: User, color: 'text-brand' },
                    { id: 'experiences', label: 'Expériences Professionnelles', icon: Briefcase, color: 'text-blue-500' },
                    { id: 'payment', label: 'Rémunération & AE', icon: CreditCard, color: 'text-emerald-500' },
                    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-purple-500' }
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

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                {activeTab === 'personal' && (
                    <div className="p-10">
                        <PersonalInfoForm 
                            profile={profile} 
                            onSave={(data, isMultipart) => handleSave('profile', '/worker/profile', data, isMultipart ? 'post' : 'put', isMultipart)} 
                            saving={saving.profile} 
                        />
                    </div>
                )}

                {activeTab === 'experiences' && (
                    <div className="p-10">
                        <ExperienceList
                            experiences={experiences}
                            workerSkills={profile?.skills || []}
                            onAddExperience={(exp) => handleSave('experience', '/worker/experiences', exp, 'post')}
                            onDeleteExperience={(id) => handleSave('experience', `/worker/experiences/${id}`, null, 'delete')}
                            saving={saving.experience}
                        />
                    </div>
                )}

                {activeTab === 'payment' && (
                    <PaymentInfoSection
                        payoutAccount={payoutAccount}
                        aeInfo={aeInfo}
                        profile={profile}
                        onSavePayout={(data) => handleSave('payout', '/worker/payout-account', data)}
                        onSaveAe={(data) => handleSave('ae', '/worker/ae-billing', data)}
                        saving={saving}
                    />
                )}

                {activeTab === 'documents' && (
                    <div className="p-10">
                        <DocumentList
                            documents={documents}
                            onUpload={(file, type) => {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('type', type);
                                handleSave('document', '/worker/documents', formData, 'post', true);
                            }}
                            onDelete={(id) => handleSave('document', `/worker/documents/${id}`, null, 'delete')}
                            saving={saving.document}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
