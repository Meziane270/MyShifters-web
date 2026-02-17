import React, { useState } from "react";
import { Briefcase, Trash2, Plus, Loader2, Save, Calendar, Building2 } from "lucide-react";

const SERVICE_TYPES = [
    { id: 'reception', label: 'Réception', icon: '🛎️' },
    { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
    { id: 'maintenance', label: 'Maintenance Technique', icon: '🛠️' },
    { id: 'restaurant', label: 'Restauration & Salle', icon: '🍽️' }
];

export default function ExperienceList({ experiences = [], onAddExperience, onDeleteExperience, saving }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newExp, setNewExp] = useState({
        company: "",
        role_title: "",
        service_type: "reception",
        start_date: "",
        end_date: "",
        description: "",
        is_current: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (typeof onAddExperience === 'function') {
            // S'assurer que role_title est bien passé au backend
            onAddExperience(newExp);
            setShowAddForm(false);
            setNewExp({
                company: "",
                role_title: "",
                service_type: "reception",
                start_date: "",
                end_date: "",
                description: "",
                is_current: false
            });
        }
    };

    return (
        <div className="p-10 space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Expériences Professionnelles</h3>
                        <p className="text-sm text-slate-500">Ajoutez vos expériences passées dans l'hôtellerie.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-light transition-all shadow-lg shadow-brand/20"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Établissement</label>
                            <input
                                type="text"
                                required
                                value={newExp.company}
                                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                                placeholder="Nom de l'hôtel / restaurant"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Métier / Poste</label>
                            <select
                                value={newExp.role_title}
                                onChange={(e) => setNewExp({ ...newExp, role_title: e.target.value, service_type: e.target.value.toLowerCase() })}
                                required
                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                            >
                                <option value="">Sélectionnez un métier</option>
                                {SERVICE_TYPES.map(s => (
                                    <option key={s.id} value={s.label}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Début</label>
                                <input
                                    type="date"
                                    required
                                    value={newExp.start_date}
                                    onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fin</label>
                                <input
                                    type="date"
                                    disabled={newExp.is_current}
                                    value={newExp.end_date}
                                    onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                        <input
                            type="checkbox"
                            id="is_current"
                            checked={newExp.is_current}
                            onChange={(e) => setNewExp({ ...newExp, is_current: e.target.checked, end_date: e.target.checked ? "" : newExp.end_date })}
                            className="h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <label htmlFor="is_current" className="text-sm font-bold text-slate-600">Poste actuel</label>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-8 py-4 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-2xl transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-light transition-all shadow-lg shadow-brand/20 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Enregistrer l'expérience
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {experiences.length > 0 ? (
                    experiences.map((exp) => (
                        <div key={exp.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                                    <Building2 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{exp.role_title}</h4>
                                    <p className="text-brand font-bold text-sm">{exp.company}</p>
                                    <div className="flex flex-wrap gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" /> 
                                            {exp.start_date} - {exp.is_current ? "Aujourd'hui" : exp.end_date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => typeof onDeleteExperience === 'function' && onDeleteExperience(exp.id)}
                                className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <Trash2 className="h-6 w-6" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Briefcase className="h-10 w-10" />
                        </div>
                        <p className="text-slate-400 font-bold">Vous n'avez pas encore ajouté d'expériences.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
