import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { 
    Star, 
    MessageSquare, 
    User, 
    Calendar, 
    Send,
    Award,
    CheckCircle2,
    X
} from "lucide-react";
import { Button } from "../../../components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelRatingsPage() {
    const { getAuthHeader } = useAuth();
    const [loading, setLoading] = useState(true);
    const [pastMissions, setPastMissions] = useState([]);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedMission, setSelectedMission] = useState(null);
    const [ratingData, setRatingData] = useState({ rating: 5, comment: "", landingPage: false });

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        try {
            // On récupère les missions terminées pour lesquelles on peut laisser un avis
            const res = await axios.get(`${API}/shifts/hotel?status=completed`, {
                headers: getAuthHeader()
            });
            setPastMissions(res.data || []);
        } catch (e) {
            toast.error("Erreur lors du chargement des missions");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    const handleSubmitRating = async () => {
        if (!ratingData.comment) {
            toast.error("Veuillez laisser un commentaire");
            return;
        }
        try {
            await axios.post(`${API}/ratings`, {
                shift_id: selectedMission.id,
                worker_id: selectedMission.worker_id,
                rating: ratingData.rating,
                comment: ratingData.comment,
                for_landing_page: ratingData.landingPage
            }, { headers: getAuthHeader() });
            
            toast.success("Avis envoyé ! Il sera vérifié par l'admin.");
            setShowRatingModal(false);
            fetchMissions();
        } catch (e) {
            toast.error("Erreur lors de l'envoi de l'avis");
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Avis & Retours</h1>
                <p className="text-slate-500 font-medium">Évaluez les extras et partagez votre expérience sur MyShifters.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <span className="h-2 w-2 bg-brand rounded-full"></span>
                        Missions à évaluer
                    </h2>

                    <div className="grid gap-4">
                        {pastMissions.length > 0 ? (
                            pastMissions.map((mission) => (
                                <div key={mission.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-brand">
                                            <User className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-tight">{mission.worker_name || "Extra Shifter"}</h4>
                                            <p className="text-brand font-bold text-sm">{mission.title}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {mission.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => { setSelectedMission(mission); setShowRatingModal(true); }}
                                        className="rounded-2xl bg-slate-900 text-white font-bold px-6 py-4 hover:bg-brand transition-all flex items-center gap-2"
                                    >
                                        <Star className="h-4 w-4" /> Laisser un avis
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-16 text-center">
                                <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">Aucune mission terminée à évaluer.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Award className="h-5 w-5 text-brand" />
                        Impact
                    </h2>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl shadow-slate-200">
                        <p className="text-sm font-medium text-white/70 leading-relaxed">
                            Vos avis aident les workers à s'améliorer et permettent à l'administration de maintenir un haut niveau de qualité sur la plateforme.
                        </p>
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                <span className="text-xs font-bold">Avis vérifiés par l'admin</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                <span className="text-xs font-bold">Visibilité sur la Landing Page</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'avis */}
            {showRatingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl space-y-8 relative">
                        <button onClick={() => setShowRatingModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Évaluer l'extra</h3>
                            <p className="text-slate-500 font-medium">Votre retour pour {selectedMission?.worker_name}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRatingData({...ratingData, rating: star})}
                                        className="transition-transform hover:scale-125"
                                    >
                                        <Star className={`h-10 w-10 ${star <= ratingData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Votre commentaire</label>
                                <textarea 
                                    value={ratingData.comment}
                                    onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                                    placeholder="Comment s'est passée la mission ?"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-900 min-h-[120px]"
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="font-bold text-slate-900">Partager sur la Landing Page</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Visible par tous après validation</p>
                                </div>
                                <button 
                                    onClick={() => setRatingData({...ratingData, landingPage: !ratingData.landingPage})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${ratingData.landingPage ? "bg-brand" : "bg-slate-200"}`}
                                >
                                    <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${ratingData.landingPage ? "right-1" : "left-1"}`}></div>
                                </button>
                            </div>

                            <Button 
                                onClick={handleSubmitRating}
                                className="w-full rounded-2xl bg-slate-900 text-white font-black py-6 hover:bg-brand shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Send className="h-5 w-5" /> Envoyer l'avis
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
