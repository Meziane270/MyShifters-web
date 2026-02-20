import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Send,
    MessageSquare,
    Clock,
    Loader2,
    Plus,
    LifeBuoy,
    RefreshCw,
    ArrowLeft
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HotelSupportPage() {
    const { user, getAuthHeader } = useAuth();
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [newSubject, setNewSubject] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [reply, setReply] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const messagesEndRef = useRef(null);

    const loadThreads = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API}/hotel/support/threads`, {
                headers: getAuthHeader()
            });
            setThreads(res.data || []);
        } catch (err) {
            console.error("Erreur support:", err);
            toast.error("Impossible de charger les conversations");
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        loadThreads();
    }, [loadThreads]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread?.messages]);

    const handleLoadMessages = async (thread) => {
        try {
            const res = await axios.get(`${API}/hotel/support/threads/${thread.id}`, {
                headers: getAuthHeader()
            });
            setSelectedThread({ ...thread, messages: res.data || [] });
            setShowNewTicketForm(false);
        } catch (err) {
            toast.error("Impossible de charger les messages");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newSubject.trim() || !newMessage.trim() || isSending) return;
        setIsSending(true);
        try {
            await axios.post(`${API}/hotel/support/threads`, {
                subject: newSubject,
                message: newMessage
            }, { headers: getAuthHeader() });
            toast.success("Ticket créé avec succès");
            setNewSubject("");
            setNewMessage("");
            setShowNewTicketForm(false);
            loadThreads();
        } catch (err) {
            toast.error("Erreur lors de la création du ticket");
        } finally {
            setIsSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedThread || isSending) return;
        setIsSending(true);
        try {
            await axios.post(`${API}/hotel/support/threads/${selectedThread.id}/messages`, {
                body: reply
            }, { headers: getAuthHeader() });
            setReply("");
            const res = await axios.get(`${API}/hotel/support/threads/${selectedThread.id}`, {
                headers: getAuthHeader()
            });
            setSelectedThread(prev => ({ ...prev, messages: res.data || [] }));
            loadThreads();
            toast.success("Message envoyé");
        } catch (err) {
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setIsSending(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Ouvert</span>;
            case 'in_progress': return <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">En cours</span>;
            case 'closed': return <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Fermé</span>;
            default: return <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <LifeBuoy className="w-8 h-8 text-brand" />
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Support</h1>
                    <p className="text-foreground/70 mt-1">Besoin d'aide ? Notre équipe est là pour vous</p>
                </div>
            </div>

            <div className="flex h-[calc(100vh-220px)] min-h-[500px] bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Sidebar threads */}
                <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-slate-50/50">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">Conversations</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadThreads}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Actualiser"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => { setShowNewTicketForm(true); setSelectedThread(null); }}
                                className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-light bg-brand/10 hover:bg-brand/15 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Nouveau
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <MessageSquare className="h-10 w-10 text-slate-200 mb-3" />
                                <p className="text-sm font-medium text-slate-500">Aucune conversation</p>
                                <p className="text-xs text-slate-400 mt-1">Créez un ticket pour contacter le support</p>
                            </div>
                        ) : (
                            threads.map((thread) => (
                                <button
                                    key={thread.id}
                                    onClick={() => handleLoadMessages(thread)}
                                    className={`w-full text-left p-4 border-b border-slate-100 hover:bg-white transition-colors ${selectedThread?.id === thread.id ? 'bg-white border-l-2 border-l-brand' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="font-semibold text-slate-800 text-sm line-clamp-1">{thread.subject}</span>
                                        {getStatusBadge(thread.status)}
                                    </div>
                                    {thread.last_message && (
                                        <p className="text-xs text-slate-400 line-clamp-1 mt-1">{thread.last_message}</p>
                                    )}
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(thread.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {showNewTicketForm ? (
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="max-w-lg">
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setShowNewTicketForm(false)} className="text-slate-400 hover:text-slate-600">
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <h2 className="font-bold text-foreground text-lg">Nouvelle demande</h2>
                                </div>
                                <form onSubmit={handleCreateTicket} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1">Sujet *</label>
                                        <input
                                            type="text"
                                            value={newSubject}
                                            onChange={(e) => setNewSubject(e.target.value)}
                                            placeholder="Ex: Problème avec une mission"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-foreground mb-1">Message *</label>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Décrivez votre problème en détail..."
                                            rows={5}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all text-sm resize-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newSubject.trim() || !newMessage.trim() || isSending}
                                        className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-light transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Envoyer la demande
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : selectedThread ? (
                        <>
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedThread(null)} className="text-slate-400 hover:text-slate-600 md:hidden">
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{selectedThread.subject}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {getStatusBadge(selectedThread.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {!selectedThread.messages || selectedThread.messages.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">Aucun message dans cette conversation</div>
                                ) : (
                                    selectedThread.messages.map((msg) => {
                                        const isFromAdmin = msg.sender_role === 'admin' || msg.is_admin;
                                        return (
                                            <div key={msg.id} className={`flex ${isFromAdmin ? 'justify-start' : 'justify-end'}`}>
                                                <div className="max-w-[80%] space-y-2">
                                                    <div className={`flex items-center gap-2 mb-1 ${isFromAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                                        <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-brand text-white">
                                                            {isFromAdmin ? 'A' : (user?.hotel_name?.charAt(0) || 'H')}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {isFromAdmin ? 'Support MyShifters' : 'Moi'}
                                                        </span>
                                                    </div>
                                                    <div className={`p-5 rounded-[2rem] text-sm font-medium shadow-sm ${
                                                        isFromAdmin
                                                            ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                                            : "bg-brand text-white rounded-tr-none"
                                                    }`}>
                                                        {msg.body}
                                                    </div>
                                                    <p className={`text-[10px] font-bold text-slate-400 px-2 ${isFromAdmin ? 'text-left' : 'text-right'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {selectedThread.status !== 'closed' && (
                                <div className="p-6 bg-white border-t border-slate-50">
                                    <form onSubmit={handleSendReply} className="relative">
                                        <input
                                            type="text"
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Écrivez votre réponse..."
                                            className="w-full pl-6 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all font-medium text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!reply.trim() || isSending}
                                            className="absolute right-2 top-2 bottom-2 px-6 bg-brand text-white rounded-2xl hover:bg-brand-light transition-all disabled:opacity-30"
                                        >
                                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
                            <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                                <MessageSquare className="h-12 w-12" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl">Vos messages</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-2">Sélectionnez une conversation ou créez une nouvelle demande pour discuter avec nous.</p>
                            </div>
                            <button
                                onClick={() => setShowNewTicketForm(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-semibold hover:bg-brand-light transition-all"
                            >
                                <Plus className="h-4 w-4" />
                                Nouvelle demande
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Foire aux questions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Pourquoi je ne peux pas créer de mission ?</h3>
                        <p className="text-sm text-foreground/70">Votre établissement doit être vérifié par notre équipe avant de pouvoir publier des missions. Ce processus prend généralement 24-48h.</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Comment modifier mes informations ?</h3>
                        <p className="text-sm text-foreground/70">Rendez-vous dans la section "Mon Profil" pour mettre à jour les informations de votre établissement.</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Où trouver mes factures ?</h3>
                        <p className="text-sm text-foreground/70">Les factures sont disponibles dans la section "Mes Factures" après la complétion des missions.</p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Comment contacter un candidat ?</h3>
                        <p className="text-sm text-foreground/70">Une fois une candidature acceptée, vous pouvez voir ses coordonnées dans la section "Candidatures".</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
