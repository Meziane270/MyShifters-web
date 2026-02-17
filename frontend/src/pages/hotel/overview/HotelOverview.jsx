import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { 
    ChevronRight, 
    CalendarDays, 
    Users, 
    DollarSign, 
    TrendingUp, 
    Plus,
    ArrowUpRight,
    Star,
    Clock
} from "lucide-react";
import { Button } from "../../../components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelOverview() {
    const { getAuthHeader, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentShifts, setRecentShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, shiftsRes] = await Promise.all([
                axios.get(`${API}/stats/hotel`, { headers: getAuthHeader() }),
                axios.get(`${API}/shifts/hotel`, { headers: getAuthHeader() }),
            ]);
            setStats(statsRes.data);
            setRecentShifts(shiftsRes.data.slice(0, 5));
        } catch {
            toast.error("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Chargement de votre espace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Bonjour, {user?.hotel_name || "Hôtel"}</h1>
                    <p className="text-slate-500 font-medium">Gérez vos besoins en extras et vos missions en cours.</p>
                </div>
                <Link to="/hotel/shifts">
                    <Button className="rounded-2xl bg-slate-900 text-white font-bold px-8 py-6 hover:bg-brand shadow-xl shadow-slate-200 hover:shadow-brand/20 transition-all flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Créer une mission
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<CalendarDays />} 
                    label="Missions Actives" 
                    value={stats?.active_shifts ?? 0} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    icon={<Users />} 
                    label="Candidatures" 
                    value={stats?.pending_applications ?? 0} 
                    color="bg-purple-500" 
                />
                <StatCard 
                    icon={<Star />} 
                    label="Note Moyenne" 
                    value="4.9" 
                    color="bg-amber-500" 
                />
                <StatCard 
                    icon={<DollarSign />} 
                    label="Dépenses Mois" 
                    value={`${(stats?.monthly_spend ?? 0).toLocaleString()} €`} 
                    color="bg-emerald-500" 
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Recent Shifts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <span className="h-2 w-2 bg-brand rounded-full"></span>
                            Missions Récentes
                        </h2>
                        <Link to="/hotel/shifts" className="text-xs font-black text-brand uppercase tracking-widest hover:underline flex items-center gap-1">
                            Voir tout <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-4">
                        {recentShifts.length > 0 ? (
                            recentShifts.map((shift) => (
                                <div key={shift.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{shift.title}</h4>
                                            <div className="flex items-center gap-4 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {shift.date}</span>
                                                <span className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {shift.applications_count || 0} candidats</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            shift.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {shift.status === 'open' ? 'Ouverte' : 'Fermée'}
                                        </span>
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-16 text-center">
                                <CalendarDays className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">Aucune mission créée pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Insights */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-brand" />
                        Aperçu
                    </h2>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl shadow-slate-200">
                        <div>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Taux de Remplissage</p>
                            <div className="flex items-end gap-4">
                                <span className="text-4xl font-black">92%</span>
                                <span className="text-emerald-400 text-xs font-bold mb-1 flex items-center"><ArrowUpRight className="h-3 w-3" /> +2%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                                <div className="bg-brand h-full w-[92%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-white/10 space-y-4">
                            <Link to="/hotel/applications" className="flex justify-between items-center group">
                                <span className="text-white/50 text-xs font-bold group-hover:text-white transition-colors">Candidatures à traiter</span>
                                <span className="font-black bg-brand px-2 py-1 rounded-lg text-[10px]">{stats?.pending_applications ?? 0}</span>
                            </Link>
                            <Link to="/hotel/support" className="flex justify-between items-center group">
                                <span className="text-white/50 text-xs font-bold group-hover:text-white transition-colors">Support MyShifters</span>
                                <span className="font-black text-xs">Contacter</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    );
}
