import React, { useState, useCallback } from "react";
import { 
    Bell, 
    Lock, 
    ShieldCheck, 
    Eye, 
    EyeOff,
    User,
    Loader2,
    Mail,
    Smartphone
} from "lucide-react";
import { useWorkerData } from "../../../hooks/useWorkerData";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function WorkerSettings() {
    const { postData } = useWorkerData();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("security");
    
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [notifs, setNotifs] = useState({
        email: true,
        push: true
    });

    const handlePasswordChange = useCallback(async (e) => {
        e.preventDefault();
        if (!passwordData.current_password || !passwordData.new_password) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        setSaving(true);
        try {
            await postData('/auth/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success("Mot de passe modifié avec succès");
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (e) {
            toast.error("Erreur lors du changement de mot de passe");
        } finally {
            setSaving(false);
        }
    }, [passwordData, postData]);

    const toggleNotif = (type) => {
        setNotifs(prev => ({ ...prev, [type]: !prev[type] }));
        toast.success(`Préférences ${type === 'email' ? 'Email' : 'Push'} mises à jour`);
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Paramètres</h1>
                <p className="text-slate-500 font-medium">Gérez la sécurité et les préférences de votre compte.</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-10">
                {/* Navigation Latérale - Tout est cliquable et fonctionnel */}
                <div className="space-y-2">
                    <button 
                        onClick={() => setActiveTab("security")} 
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === "security" 
                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Lock className={`h-5 w-5 ${activeTab === "security" ? "text-white" : "text-brand"}`} />
                        Sécurité
                    </button>
                    <button 
                        onClick={() => setActiveTab("notifications")} 
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === "notifications" 
                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Bell className={`h-5 w-5 ${activeTab === "notifications" ? "text-white" : "text-brand"}`} />
                        Notifications
                    </button>
                    <Link 
                        to="/worker/profile"
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                    >
                        <User className="h-5 w-5 text-brand" />
                        Mon Profil
                    </Link>
                </div>

                {/* Contenu - Double authentification et Préférences retirées comme demandé */}
                <div className="lg:col-span-3">
                    {activeTab === "security" && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Mot de passe</h3>
                            </div>

                            <form onSubmit={handlePasswordChange} className="grid gap-6 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mot de passe actuel</label>
                                    <div className="relative">
                                        <input 
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-900"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand transition-colors">
                                            {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input 
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-900"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand transition-colors">
                                            {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <input 
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-bold text-slate-900"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand transition-colors">
                                            {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-2xl bg-slate-900 text-white font-bold py-6 hover:bg-brand shadow-xl shadow-slate-200 hover:shadow-brand/20 transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mettre à jour le mot de passe"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shadow-lg shadow-brand/5">
                                    <Bell className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Préférences de Notification</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-brand/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${notifs.email ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-slate-300'}`}>
                                            <Mail className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">Alertes par Email</p>
                                            <p className="text-sm text-slate-400 font-medium">Recevoir les nouvelles missions par email.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleNotif('email')}
                                        className={`w-14 h-8 rounded-full transition-all relative ${notifs.email ? 'bg-brand' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 h-6 w-6 bg-white rounded-full transition-all shadow-sm ${notifs.email ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-brand/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${notifs.push ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-slate-300'}`}>
                                            <Smartphone className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">Notifications Push</p>
                                            <p className="text-sm text-slate-400 font-medium">Recevoir des alertes sur votre navigateur.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleNotif('push')}
                                        className={`w-14 h-8 rounded-full transition-all relative ${notifs.push ? 'bg-brand' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 h-6 w-6 bg-white rounded-full transition-all shadow-sm ${notifs.push ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
