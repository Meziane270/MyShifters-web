import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { 
    RefreshCw,
    Briefcase,
    CheckCircle2,
    Clock4,
    XCircle
} from "lucide-react";
import ShiftCard from "./components/ShiftCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MyMissions() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState("upcoming");

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/applications/worker`, {
                headers: getAuthHeader()
            });
            setApplications(res.data || []);
        } catch (e) {
            toast.error("Impossible de charger vos missions");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    const handleComplete = useCallback(async (applicationId) => {
        try {
            await axios.post(`${API}/missions/${applicationId}/complete`, {}, {
                headers: getAuthHeader()
            });
            toast.success("Mission marquée comme terminée");
            fetchMissions();
        } catch (e) {
            toast.error("Erreur lors de la validation");
        }
    }, [getAuthHeader, fetchMissions]);

    const filtered = applications.filter(app => {
        if (activeTab === "upcoming") return app.status === "accepted";
        if (activeTab === "completed") return app.status === "completed";
        if (activeTab === "cancelled") return app.status === "cancelled" || app.status === "rejected";
        return true;
    });

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Mes Missions</h1>
                    <p className="text-slate-500 font-medium">Gérez votre planning et vos missions terminées.</p>
                </div>
                <button 
                    onClick={fetchMissions}
                    className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand transition-all shadow-sm"
                >
                    <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                {[
                    { id: 'upcoming', label: 'À venir', icon: Clock4, color: 'text-brand' },
                    { id: 'completed', label: 'Terminées', icon: CheckCircle2, color: 'text-emerald-500' },
                    { id: 'cancelled', label: 'Annulées', icon: XCircle, color: 'text-red-500' }
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
                        {tab.label} ({applications.filter(app => {
                            if (tab.id === "upcoming") return app.status === "accepted";
                            if (tab.id === "completed") return app.status === "completed";
                            if (tab.id === "cancelled") return app.status === "cancelled" || app.status === "rejected";
                            return false;
                        }).length})
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {loading && applications.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-brand" />
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map((app) => (
                        <ShiftCard
                            key={app.id}
                            application={app}
                            type={activeTab === 'upcoming' ? 'mission' : activeTab}
                            onComplete={() => handleComplete(app.id)}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Briefcase className="h-10 w-10" />
                        </div>
                        <p className="text-slate-400 font-bold">Aucune mission dans cette catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
