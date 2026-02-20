import React, { useState, useEffect } from "react";
import { Save, Loader2, Camera, User } from "lucide-react";
import { toast } from "sonner";

export default function PersonalInfoForm({ profile, onSave, saving }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        address: "",
        city: "",
        postal_code: "",
        avatar_url: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                date_of_birth: profile.date_of_birth || "",
                address: profile.address || "",
                city: profile.city || "",
                postal_code: profile.postal_code || "",
                avatar_url: profile.avatar_url || profile.avatar || profile.photo_url || profile.profile_picture || "",
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error("La photo ne doit pas dépasser 10 Mo");
            return;
        }

        const formDataFile = new FormData();
        formDataFile.append('file', file); // Changé de 'avatar' à 'file' pour correspondre au backend
        
        if (onSave) {
            await onSave(formDataFile, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email) {
            toast.error("Le prénom, le nom et l'email sont requis");
            return;
        }

        const { avatar_url, ...updateData } = formData;
        if (onSave) {
            await onSave(updateData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="flex flex-col items-center gap-6 pb-10 border-b border-slate-50">
                <div className="relative group">
                    <div className="h-40 w-40 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-brand/5 text-brand">
                                <User className="h-16 w-16" />
                            </div>
                        )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 h-14 w-14 bg-brand text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:bg-brand-light hover:scale-110 transition-all border-4 border-white">
                        <Camera className="h-6 w-6" />
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-slate-900 tracking-tight">Votre Photo de Profil</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Format JPG ou PNG • Max 10 Mo</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Prénom *</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nom *</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Professionnel</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Téléphone Mobile</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+33 6 00 00 00 00"
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date de naissance</label>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ville de résidence</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Code postal</label>
                    <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Adresse Complète</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-slate-900"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-12 py-5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-light transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Mettre à jour mon profil
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
