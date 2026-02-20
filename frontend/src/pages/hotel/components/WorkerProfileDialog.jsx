import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Star, Briefcase, Phone, Mail, User } from "lucide-react";

const SERVICE_COLORS = {
    reception: "bg-blue-500/15 text-blue-700",
    housekeeping: "bg-emerald-500/15 text-emerald-700",
    maintenance: "bg-orange-500/15 text-orange-700",
    restaurant: "bg-purple-500/15 text-purple-700",
};

const SERVICE_LABELS = {
    reception: "Reception",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    restaurant: "Restauration",
};

export default function WorkerProfileDialog({ isOpen, onClose, workerProfile, loading, error }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white border border-slate-100 text-slate-900 max-w-lg rounded-[2rem] shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900">Profil du candidat</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                    </div>
                ) : workerProfile ? (
                    <div className="space-y-6 pb-2">
                        <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl">
                            <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black text-2xl shrink-0 overflow-hidden">
                                {workerProfile.avatar_url ? (
                                    <img src={workerProfile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">
                                    {workerProfile.first_name && workerProfile.last_name
                                        ? workerProfile.first_name + " " + workerProfile.last_name
                                        : workerProfile.name || workerProfile.email}
                                </h3>
                                {workerProfile.email && (
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        {workerProfile.email}
                                    </div>
                                )}
                                {workerProfile.phone && (
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                                        <Phone className="h-3.5 w-3.5" />
                                        {workerProfile.phone}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                                <div className="text-2xl font-black text-emerald-700">{workerProfile.total_completed || 0}</div>
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Missions</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-2xl font-black text-amber-700">{workerProfile.avg_rating || "—"}</span>
                                    {workerProfile.avg_rating && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                                </div>
                                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Note moy.</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                                <div className="text-2xl font-black text-blue-700">{workerProfile.ratings_count || 0}</div>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Avis</div>
                            </div>
                        </div>

                        {Array.isArray(workerProfile.skills) && workerProfile.skills.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Competences</h4>
                                <div className="flex flex-wrap gap-2">
                                    {workerProfile.skills.map((s) => (
                                        <span key={s} className={"px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest " + (SERVICE_COLORS[s] || "bg-slate-100 text-slate-600")}>
                                            {SERVICE_LABELS[s] || s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {workerProfile.bio && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bio</h4>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl">{workerProfile.bio}</p>
                            </div>
                        )}

                        {(workerProfile.business_name || workerProfile.siret) && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entreprise</h4>
                                {workerProfile.business_name && <p className="text-sm font-bold text-slate-700">{workerProfile.business_name}</p>}
                                {workerProfile.siret && <p className="text-xs text-slate-500 mt-0.5">SIRET : {workerProfile.siret}</p>}
                            </div>
                        )}

                        {workerProfile.experience_years > 0 && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                                <Briefcase className="h-5 w-5 text-brand" />
                                <span className="text-sm font-bold text-slate-700">
                                    {workerProfile.experience_years} an{workerProfile.experience_years > 1 ? "s" : ""} d experience
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-10 text-center text-sm text-slate-400">
                        Selectionnez un candidat pour voir son profil.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
