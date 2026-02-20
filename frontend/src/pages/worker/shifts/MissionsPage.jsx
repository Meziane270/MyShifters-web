import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
    Search, 
    Filter, 
    MapPin, 
    Calendar, 
    Clock, 
    Briefcase,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Lock,
    FileText,
    Euro
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import ShiftDetailModal from "./components/ShiftDetailModal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MissionsPage() {
    const { user, getAuthHeader } = useAuth();
    const [allMissions, setAllMissions] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedJob, setSelectedJob] = useState("Tous");
    const [activeTab, setActiveTab] = useState("available");
    const [loading, setLoading] = useState(true);
    
    // Pour la modal de détails
    const [selectedShift, setSelectedShift] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Métiers pour le filtre
    const jobs = ["Tous", "Réception", "Housekeeping", "Maintenance technique", "Restauration & Salle"];

    // Vérification du statut du profil
    const isVerified = user?.verification_status === 'verified';

    const loadMissions = useCallback(async () => {
        setLoading(true);
        try {
            const [shiftsRes, appsRes] = await Promise.all([
                axios.get(`${API}/shifts`, { headers: getAuthHeader() }),
                axios.get(`${API}/applications/worker`, { headers: getAuthHeader() })
            ]);
            setAllMissions(shiftsRes.data || []);
            setMyApplications(appsRes.data || []);
        } catch (err) {
            console.error("Erreur missions:", err);
            toast.error("Erreur lors du chargement des missions");
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        loadMissions();
    }, [loadMissions]);

    const calculateTotalPay = (mission) => {
        if (!mission) return 0;
        const rate = mission.hourly_rate || 0;
        
        // Calcul de la durée en heures
        let duration = 0;
        if (mission.start_time && mission.end_time) {
            const [startH, startM] = mission.start_time.split(':').map(Number);
            const [endH, endM] = mission.end_time.split(':').map(Number);
            
            let startMinutes = startH * 60 + startM;
            let endMinutes = endH * 60 + endM;
            
            if (endMinutes <= startMinutes) {
                endMinutes += 24 * 60; // Mission de nuit
            }
            duration = (endMinutes - startMinutes) / 60;
        }
        
        const days = Array.isArray(mission.dates) ? mission.dates.length : 1;
        return (rate * duration * days).toFixed(2);
    };

    const availableMissions = useMemo(() => {
        return allMissions.filter(mission => {
            const matchesSearch = (mission.hotel_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (mission.title || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            let matchesJob = selectedJob === "Tous";
            if (!matchesJob) {
                const serviceType = (mission.service_type || "").toLowerCase();
                const jobLower = selectedJob.toLowerCase();
                
                if (jobLower === "réception") matchesJob = serviceType === "reception";
                else if (jobLower === "housekeeping") matchesJob = serviceType === "housekeeping";
                else if (jobLower === "restauration & salle") matchesJob = serviceType === "restaurant";
                else if (jobLower === "maintenance technique") matchesJob = serviceType === "maintenance";
            }

            const alreadyApplied = myApplications.some(app => app.shift_id === mission.id);
            return matchesSearch && matchesJob && !alreadyApplied && mission.status === "open";
        });
    }, [allMissions, myApplications, searchQuery, selectedJob]);

    const confirmedMissions = useMemo(() => {
        return myApplications.filter(app => app.status === "accepted");
    }, [myApplications]);

    const applicationsMissions = useMemo(() => {
        return myApplications.filter(app => app.status === "pending");
    }, [myApplications]);

    const handleOpenDetails = (mission) => {
        setSelectedShift(mission);
        setModalOpen(true);
    };

    if (loading && allMissions.length === 0) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-slate-500 font-medium">Recherche des meilleures opportunités...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Mes Missions</h1>
                    <p className="text-slate-500 font-medium">Trouvez et gérez vos engagements professionnels.</p>
                </div>
            </div>

            {/* Navigation par Onglets - Disponibles (à gauche) - Candidatures - Confirmées */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                {[
                    { id: 'available', label: 'Disponibles', icon: Briefcase, color: 'text-brand' },
                    { id: 'applications', label: 'Candidatures', icon: FileText, color: 'text-blue-500' },
                    { id: 'confirmed', label: 'Confirmées', icon: CheckCircle2, color: 'text-emerald-500' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === tab.id 
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Barre de recherche et filtres pour les missions disponibles */}
            {activeTab === 'available' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher par hôtel ou métier..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-medium text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 mr-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Filter className="h-4 w-4" /> Filtrer par métier :
                        </div>
                        {jobs.map((job) => (
                            <button
                                key={job}
                                onClick={() => setSelectedJob(job)}
                                className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${
                                    selectedJob === job 
                                    ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                                    : 'bg-white text-slate-500 border border-slate-100 hover:border-brand/30'
                                }`}
                            >
                                {job}
                            </button>
                        ))}
                    </div>

                    {!isVerified && (
                        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                            <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                <Lock className="h-8 w-8" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-amber-900">Profil en attente de vérification</h3>
                                <p className="text-amber-700/80 font-medium mt-1">
                                    L'administration doit examiner vos documents avant que vous ne puissiez postuler à des missions.
                                </p>
                            </div>
                            <Link to="/worker/profile" className="px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold text-sm hover:bg-amber-700 transition-all shadow-lg shadow-amber-200">
                                Vérifier mon profil
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Liste des missions */}
            <div className="grid gap-6">
                {activeTab === 'available' && (
                    availableMissions.length > 0 ? (
                        availableMissions.map((mission) => (
                            <div 
                                key={mission.id} 
                                onClick={() => handleOpenDetails(mission)}
                                className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 cursor-pointer"
                            >
                                <div className="flex items-center gap-8">
                                    <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                                        <Briefcase className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xl leading-tight">{mission.title}</h4>
                                        <p className="text-brand font-bold text-sm mt-1">{mission.hotel_name}</p>
                                        <div className="flex flex-wrap gap-6 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" /> 
                                                {Array.isArray(mission.dates) ? `${mission.dates.length} date(s)` : mission.date || "Date non définie"}
                                            </span>
                                            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mission.start_time} - {mission.end_time}</span>
                                            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {mission.hotel_city || "Paris"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-slate-900">{calculateTotalPay(mission)} €</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total estimé</p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDetails(mission);
                                        }}
                                        className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
                                    >
                                        Détails <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={Search} text="Aucune mission disponible avec ces critères." />
                    )
                )}

                {activeTab === 'applications' && (
                    applicationsMissions.length > 0 ? (
                        applicationsMissions.map((app) => (
                            <MissionItem key={app.id} mission={app} type="pending" onClick={() => handleOpenDetails(app.shift_details)} />
                        ))
                    ) : (
                        <EmptyState icon={FileText} text="Vous n'avez aucune candidature en cours." />
                    )
                )}

                {activeTab === 'confirmed' && (
                    confirmedMissions.length > 0 ? (
                        confirmedMissions.map((app) => (
                            <MissionItem key={app.id} mission={app} type="confirmed" onClick={() => handleOpenDetails(app.shift_details)} />
                        ))
                    ) : (
                        <EmptyState icon={CheckCircle2} text="Aucune mission confirmée pour le moment." />
                    )
                )}
            </div>

            {/* Modal de détails */}
            <ShiftDetailModal 
                shift={selectedShift}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    loadMissions();
                }}
            />
        </div>
    );
}

function MissionItem({ mission, type, onClick }) {
    const statusConfig = {
        accepted: { label: "Confirmée", color: "bg-emerald-100 text-emerald-700" },
        pending: { label: "En attente", color: "bg-blue-100 text-blue-700" }
    };

    const config = statusConfig[mission.status] || statusConfig.pending;

    return (
        <div 
            onClick={onClick}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:shadow-md transition-all"
        >
            <div className="flex items-center gap-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${type === 'confirmed' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                    <Briefcase className="h-8 w-8" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{mission.shift_title}</h4>
                    <p className="text-brand font-bold text-sm">{mission.hotel_name}</p>
                    <div className="flex gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {mission.shift_date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {mission.shift_start_time}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                    {config.label}
                </span>
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-brand hover:text-white transition-all">
                    <ArrowRight className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                <Icon className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-bold">{text}</p>
        </div>
    );
}
