import React, { useEffect, useState, useCallback } from "react";
import { Star, Calendar, Hotel, Loader2, MessageSquare } from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { useAuth } from "../../../context/AuthContext";

export default function MyRatings() {
    const { user } = useAuth();
    const { fetchData, loading } = useWorkerData();
    const [ratings, setRatings] = useState([]);
    const [stats, setStats] = useState({
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });

    const loadRatings = useCallback(async () => {
        try {
            const res = await fetchData('/worker/ratings');
            if (res) {
                const dynamicRatings = res.ratings || [];
                setRatings(dynamicRatings);
                
                setStats(res.stats || {
                    average: user?.rating || 0,
                    count: dynamicRatings.length,
                    distribution: res.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                });
            }
        } catch (err) {
            console.error("Erreur chargement avis:", err);
        }
    }, [fetchData, user?.rating]);

    useEffect(() => {
        loadRatings();
    }, [loadRatings]);

    if (loading && ratings.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Chargement de vos avis...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Mes Avis</h1>
                    <p className="text-slate-500 font-medium">Consultez les retours des établissements après vos missions.</p>
                </div>
                
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                        <Star className="h-7 w-7 fill-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Note Moyenne</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats.average.toFixed(1)} / 5</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="text-center lg:border-r lg:border-slate-50 lg:pr-12">
                        <div className="text-7xl font-black text-slate-900 tracking-tighter">
                            {stats.average.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`h-6 w-6 ${i < Math.round(stats.average) ? "text-amber-400 fill-amber-400" : "text-slate-100"}`} 
                                />
                            ))}
                        </div>
                        <p className="text-sm font-bold text-slate-400 mt-4 uppercase tracking-widest">
                            {stats.count} avis au total
                        </p>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-6">
                                <span className="text-xs font-black text-slate-400 w-6">{star}★</span>
                                <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 transition-all duration-1000"
                                        style={{
                                            width: `${stats.count > 0
                                                ? (stats.distribution[star] / stats.count) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-black text-slate-900 w-6 text-right">
                                    {stats.distribution[star] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Avis détaillés</h2>
                {ratings.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <MessageSquare className="h-10 w-10" />
                        </div>
                        <p className="text-slate-400 font-bold">Vous n'avez pas encore reçu d'avis.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {ratings.map((rating) => (
                            <div key={rating.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                                            <Hotel className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{rating.hotel_name}</h4>
                                            <p className="text-brand font-bold text-sm">{rating.shift_title || "Mission"}</p>
                                            <div className="flex items-center gap-1 mt-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`h-4 w-4 ${i < rating.rating ? "text-amber-400 fill-amber-400" : "text-slate-100"}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(rating.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                {rating.comment && (
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                                        <p className="text-slate-600 font-medium italic leading-relaxed">
                                            "{rating.comment}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
