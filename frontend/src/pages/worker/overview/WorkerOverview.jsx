import React, { useState, useEffect, useCallback } from "react";
import { 
    TrendingUp, 
    Clock, 
    Star, 
    Calendar, 
    ArrowRight, 
    Briefcase,
    Bell,
    ChevronRight,
    Loader2,
    ArrowUpRight,
    Euro
} from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

export default function WorkerOverview() {
    const { user } = useAuth();
    const { fetchData, loading } = useWorkerData();
    const [stats, setStats] = useState({
        total_earnings: 0,
        hours_worked: 0,
        completed_shifts: 0,
        rating: 5.0,
        this_month_earned: 0
    });
    const [nextShifts, setNextShifts] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const loadDashboardData = useCallback(async () => {
        try {
            const [earnings, workerStats, apps] = await Promise.all([
                fetchData('/worker/earnings').catch(() => ({ total: 0, thisMonth: 0 })),
                fetchData('/stats/worker').catch(() => ({ total_hours: 0, total_shifts_completed: 0 })),
                fetchData('/applications/worker').catch(() => [])
            ]);

            setStats({
                total_earnings: earnings?.total || 0,
                this_month_earned: earnings?.thisMonth || 0,
                hours_worked: workerStats?.total_hours || 0,
                completed_shifts: workerStats?.total_shifts_completed || 0,
                rating: user?.rating || 5.0
            });

            const upcoming = (apps || [])
                .filter(app => app.status === 'accepted')
                .slice(0, 3);
            setNextShifts(upcoming);

            setNotifications([
                { id: 1, text: "Bienvenue sur votre nouveau tableau de bord", time: "Maintenant", type: "info" }
            ]);

        } catch (err) {
            console.error("Erreur dashboard:", err);
        }
    }, [fetchData, user]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    if (loading && stats.total_earnings === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Préparation de votre espace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">
                        Bonjour, <span className="text-brand">{user?.first_name || "Shifter"}</span> 👋
                    </h1>
                    <p className="text-slate-500 font-medium">Voici l'état réel de votre activité MyShifters.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand group-hover:border-brand/20 transition-all shadow-sm">
                            <Bell className="h-6 w-6" />
                            {notifications.length > 0 && <span className="absolute top-3 right-3 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-50 p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50">
                            <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">Notifications</h4>
                            <div className="space-y-4">
                                {notifications.map(n => (
                                    <div key={n.id} className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                        <div className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-brand'}`}></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-tight">{n.text}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune notification</p>}
                            </div>
                        </div>
                    </div>
                    <Link to="/worker/missions" className="h-14 px-6 bg-brand text-white rounded-2xl flex items-center gap-3 font-bold text-sm hover:bg-brand-light transition-all shadow-xl shadow-brand/20 group">
                        Trouver une mission <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Euro className="h-6 w-6" />} 
                    label="Gains Totaux" 
                    value={`${stats.total_earnings.toLocaleString('fr-FR')} €`}
                    subtext="Revenus validés"
                    color="bg-emerald-500"
                />
                <StatCard 
                    icon={<TrendingUp className="h-6 w-6" />} 
                    label="Ce mois-ci" 
                    value={`${stats.this_month_earned.toLocaleString('fr-FR')} €`}
                    subtext="En cours"
                    color="bg-brand"
                />
                <Link to="/worker/missions" className="block group">
                    <StatCard 
                        icon={<Briefcase className="h-6 w-6" />} 
                        label="Missions" 
                        value={stats.completed_shifts}
                        subtext="Terminées"
                        color="bg-blue-500"
                        isClickable
                    />
                </Link>
                <Link to="/worker/ratings" className="block group">
                    <StatCard 
                        icon={<Star className="h-6 w-6" />} 
                        label="Note moyenne" 
                        value={`${stats.rating.toFixed(1)} / 5`}
                        subtext="Réputation"
                        color="bg-amber-500"
                        isClickable
                    />
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-brand" />
                            <h2 className="text-2xl font-bold text-slate-900">Mon Planning</h2>
                        </div>
                        <Link to="/worker/missions" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                            Voir tout <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {nextShifts.length > 0 ? (
                            nextShifts.map((app) => (
                                <div key={app.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                                            <Briefcase className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{app.shift_title || app.shift?.title}</h4>
                                            <p className="text-brand font-bold text-sm">{app.hotel_name || app.shift?.hotel_name}</p>
                                            <div className="flex gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {app.shift_date || app.shift?.date}</span>
                                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {app.shift_start_time || app.shift?.start_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                                        <ChevronRight className="h-6 w-6" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-16 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                    <Calendar className="h-10 w-10" />
                                </div>
                                <p className="text-slate-400 font-bold">Aucune mission prévue prochainement.</p>
                                <Link to="/worker/missions" className="mt-6 inline-block px-8 py-4 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-light transition-all shadow-lg shadow-brand/20">
                                    Trouver une mission
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-brand p-8 rounded-[3rem] text-white shadow-2xl shadow-brand/20">
                        <TrendingUp className="h-10 w-10 text-white/50 mb-6" />
                        <h3 className="text-2xl font-black tracking-tight leading-tight">Boostez votre profil MyShifters</h3>
                        <p className="text-brand-light mt-4 font-bold text-sm leading-relaxed">
                            Complétez votre profil à 100% pour attirer plus d'établissements et débloquer de nouvelles opportunités.
                        </p>
                        <Link 
                            to="/worker/profile" 
                            className="inline-flex items-center gap-2 mt-8 text-white font-black text-xs uppercase tracking-widest group"
                        >
                            Compléter mon profil
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext, color, isClickable }) {
    return (
        <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all group h-full ${isClickable ? 'hover:shadow-xl hover:border-brand/20 cursor-pointer' : ''}`}>
            <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                {subtext}
            </p>
        </div>
    );
}
