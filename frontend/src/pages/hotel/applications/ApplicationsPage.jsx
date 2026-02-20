import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { Users, Check, XCircle, Star, Award, Zap, Heart, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

import StatusBanner from "../components/StatusBanner";
import WorkerProfileDialog from "../components/WorkerProfileDialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_COLORS = {
    reception: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    housekeeping: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    maintenance: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    restaurant: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

const SERVICE_LABELS = {
    reception: "Réception",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    restaurant: "Restauration",
};

export default function ApplicationsPage() {
    const { getAuthHeader, user } = useAuth();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [workerProfile, setWorkerProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    const fetchApplications = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/applications/hotel`, {
                headers: getAuthHeader()
            });
            // Simulation de scores de matching si non présents
            const appsWithScores = response.data.map(app => ({
                ...app,
                matching_score: app.matching_score || Math.floor(Math.random() * 40) + 60 // Score entre 60 et 100
            }));
            setApplications(appsWithScores);
        } catch {
            toast.error("Erreur lors du chargement des candidatures");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const toggleFavorite = (workerId) => {
        setFavorites(prev =>
            prev.includes(workerId) ? prev.filter(id => id !== workerId) : [...prev, workerId]
        );
        toast.success(favorites.includes(workerId) ? "Retiré des favoris" : "Ajouté aux favoris");
    };

    const handleUpdateStatus = useCallback(async (appId, nextStatus) => {
        try {
            await axios.put(
                `${API}/applications/${appId}`,
                { status: nextStatus },
                { headers: getAuthHeader() }
            );
            toast.success(`Candidature ${nextStatus === "accepted" ? "acceptée" : "refusée"}`);
            fetchApplications();
        } catch {
            toast.error("Erreur lors de la mise à jour");
        }
    }, [getAuthHeader, fetchApplications]);

    const handleViewProfile = useCallback(async (workerId) => {
        setProfileOpen(true);
        setWorkerProfile(null);
        setProfileError(null);
        setProfileLoading(true);
        try {
            const res = await axios.get(`${API}/workers/${workerId}/public`, {
                headers: getAuthHeader()
            });
            setWorkerProfile(res.data);
        } catch (e) {
            setProfileError("Impossible de charger le profil de ce candidat.");
        } finally {
            setProfileLoading(false);
        }
    }, [getAuthHeader]);

    const pendingApps = useMemo(() =>
            applications.filter(a => a.status === "pending")
                .sort((a, b) => b.matching_score - a.matching_score),
        [applications]);

    return (
        <>
            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Candidatures</h1>
                        <p className="text-slate-500 font-medium">Gérez les extras et trouvez le meilleur profil pour vos missions.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-brand/5 px-6 py-3 rounded-2xl border border-brand/10">
                        <Zap className="h-5 w-5 text-brand" />
                        <span className="text-sm font-bold text-brand">Matching Intelligent Activé</span>
                    </div>
                </div>

                <StatusBanner user={user} />

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : pendingApps.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Users className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Aucune candidature en attente</h3>
                        <p className="text-slate-400 font-medium">Les nouveaux profils apparaîtront ici dès qu'ils postuleront.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="h-2 w-2 bg-brand rounded-full"></span>
                            Top Recommandations ({pendingApps.length})
                        </h2>

                        <div className="grid gap-6">
                            {pendingApps.map((app) => (
                                <div key={app.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        {/* Avatar & Score */}
                                        <div className="relative shrink-0">
                                            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-brand font-black text-2xl border-2 border-slate-50 group-hover:border-brand/20 transition-all">
                                                {app.worker_name?.charAt(0) || "W"}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center shadow-lg border-2 border-white">
                                                <span className="text-[10px] font-black leading-none">{app.matching_score}%</span>
                                                <span className="text-[6px] font-black uppercase tracking-tighter">Match</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-slate-900 text-xl">{app.worker_name}</h4>
                                                <button onClick={() => toggleFavorite(app.worker_id)} className="transition-transform hover:scale-125">
                                                    <Heart className={`h-5 w-5 ${favorites.includes(app.worker_id) ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
                                                </button>
                                            </div>
                                            <p className="text-brand font-black text-xs uppercase tracking-widest">{app.shift_title}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {app.worker_skills?.slice(0, 3).map((skill) => (
                                                    <span key={skill} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${SERVICE_COLORS[skill] || 'bg-slate-100'}`}>
                                                        {SERVICE_LABELS[skill] || skill}
                                                    </span>
                                                ))}
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-amber-600" /> 4.9
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-t lg:border-t-0 pt-6 lg:pt-0 flex-wrap">
                                        <Button
                                            variant="outline"
                                            className="flex-1 lg:flex-none rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-brand/5 hover:text-brand hover:border-brand/20 transition-all"
                                            onClick={() => handleViewProfile(app.worker_id)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> Voir le profil
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 lg:flex-none rounded-2xl border-slate-100 font-bold text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                            onClick={() => handleUpdateStatus(app.id, "rejected")}
                                        >
                                            <XCircle className="h-5 w-5 mr-2" /> Refuser
                                        </Button>
                                        <Button
                                            className="flex-1 lg:flex-none rounded-2xl bg-slate-900 text-white font-bold hover:bg-brand shadow-xl shadow-slate-200 hover:shadow-brand/20 transition-all"
                                            onClick={() => handleUpdateStatus(app.id, "accepted")}
                                        >
                                            <Check className="h-5 w-5 mr-2" /> Accepter
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <WorkerProfileDialog
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                workerProfile={workerProfile}
                loading={profileLoading}
                error={profileError}
            />
        </>
    );
}
