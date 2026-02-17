import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import { 
    Users, 
    Hotel, 
    Briefcase, 
    DollarSign, 
    TrendingUp, 
    AlertTriangle, 
    MessageSquare, 
    Shield, 
    Zap,
    ArrowUpRight,
    BarChart3
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminOverview() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admin/stats`, {
                headers: getAuthHeader()
            });
            setStats(res.data);
        } catch (e) {
            toast.error("Impossible de charger les statistiques");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Dashboard Global</h1>
                    <p className="text-slate-500 font-medium">Pilotage stratégique de la plateforme MyShifters.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-200 font-bold" onClick={fetchStats}>
                        Actualiser
                    </Button>
                    <Button className="rounded-2xl bg-slate-900 text-white font-bold hover:bg-brand shadow-xl shadow-slate-200 transition-all">
                        Exporter Rapport
                    </Button>
                </div>
            </div>

            {/* Stats Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard icon={<Users />} label="Utilisateurs" value={stats?.total_users ?? 0} trend="+12%" color="bg-blue-500" />
                <AdminStatCard icon={<Hotel />} label="Hôtels" value={stats?.total_hotels ?? 0} trend="+5%" color="bg-purple-500" />
                <AdminStatCard icon={<Briefcase />} label="Workers" value={stats?.total_workers ?? 0} trend="+18%" color="bg-emerald-500" />
                <AdminStatCard icon={<DollarSign />} label="Volume d'Affaires" value={`${(stats?.total_revenue ?? 0).toLocaleString()} €`} trend="+24%" color="bg-brand" />
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Alertes & Modération */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                        Actions Prioritaires
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <ActionCard 
                            icon={<Shield className="text-amber-500" />} 
                            title="Vérifications" 
                            count={stats?.pending_workers ?? 0} 
                            label="Profils en attente" 
                            link="/admin/verifications"
                        />
                        <ActionCard 
                            icon={<MessageSquare className="text-blue-500" />} 
                            title="Support" 
                            count={stats?.open_support_threads ?? 0} 
                            label="Tickets ouverts" 
                            link="/admin/support"
                        />
                        <ActionCard 
                            icon={<AlertTriangle className="text-red-500" />} 
                            title="Litiges" 
                            count={stats?.open_disputes ?? 0} 
                            label="Conflits à régler" 
                            link="/admin/disputes"
                        />
                        <ActionCard 
                            icon={<Zap className="text-brand" />} 
                            title="Missions" 
                            count={stats?.shifts_today ?? 0} 
                            label="Créées aujourd'hui" 
                            link="/admin/users"
                        />
                    </div>
                </div>

                {/* Performance & Insights */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-brand" />
                        Insights
                    </h2>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl shadow-slate-200">
                        <div>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Taux de Remplissage</p>
                            <div className="flex items-end gap-4">
                                <span className="text-4xl font-black">84%</span>
                                <span className="text-emerald-400 text-xs font-bold mb-1 flex items-center"><ArrowUpRight className="h-3 w-3" /> +4%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                                <div className="bg-brand h-full w-[84%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs font-bold">Actifs (7j)</span>
                                <span className="font-black">{stats?.active_users_7d ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50 text-xs font-bold">Candidatures (24h)</span>
                                <span className="font-black">{stats?.applications_today ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ icon, label, value, trend, color }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                </div>
                <span className="text-emerald-500 text-xs font-black">{trend}</span>
            </div>
        </div>
    );
}

function ActionCard({ icon, title, count, label, link }) {
    return (
        <Link to={link} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-brand/20 hover:shadow-xl transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h4 className="font-black text-slate-900 text-sm">{title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{count}</div>
        </Link>
    );
}
